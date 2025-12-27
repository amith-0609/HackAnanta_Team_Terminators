import { useState, useCallback, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2, CheckCircle, Circle, Book, AlertCircle, Share2, Workflow, Maximize2, Minimize2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Position,
    MarkerType,
    Node,
    Edge,
    NodeProps,
    Handle,
    ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';

import { resources as staticResources } from "@/data/resources";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";

interface Module {
    title: string;
    description: string;
    topics: string[];
}

interface Roadmap {
    title: string;
    description: string;
    modules: Module[];
}


interface SimplifiedSavedRoadmapData {
    nodes: Node[];
    edges: Edge[];
    updatedAt: any;
}

// --- Custom Node Component ---
const TopicNode = ({ data, id }: NodeProps) => {
    return (
        <div className={cn(
            "px-4 py-2 rounded-lg shadow-sm border-2 min-w-[150px] transition-all bg-card text-card-foreground",
            data.completed ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-muted-foreground/20 hover:border-primary/50"
        )}>
            <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
            <div className="flex items-start gap-2">
                <div
                    className={cn(
                        "mt-1 w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-colors",
                        data.completed ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground hover:border-primary"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Call the onToggle handler passed via data
                        if (data.onToggle) data.onToggle(id);
                    }}
                >
                    {data.completed && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div className="text-sm font-medium leading-tight">
                    {data.label}
                </div>
            </div>
            <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
        </div>
    );
};

const nodeDefaults = {
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
};

// Custom Node Layout Algorithm (Simple horizontal tree)
const getLayoutElements = (roadmap: Roadmap, onToggle: (id: string) => void) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Root Node
    const rootId = 'root';
    nodes.push({
        id: rootId,
        type: 'input',
        data: { label: roadmap.title },
        position: { x: 0, y: 300 },
        sourcePosition: Position.Right,
        style: {
            background: '#1e293b',
            color: 'white',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: 'bold',
            minWidth: 150
        },
    });

    let yOffset = 0;
    const moduleX = 300;
    const topicX = 600;

    roadmap.modules.forEach((module, mIndex) => {
        const moduleId = `m-${mIndex}`;

        // Calculate Y position roughly to center children
        const moduleHeight = module.topics.length * 80;
        const moduleY = yOffset + (moduleHeight / 2);

        nodes.push({
            id: moduleId,
            data: { label: module.title },
            position: { x: moduleX, y: moduleY },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            style: {
                background: '#fff',
                color: '#0f172a',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: '600',
                width: 200
            },
        });

        edges.push({
            id: `e-${rootId}-${moduleId}`,
            source: rootId,
            target: moduleId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
        });

        module.topics.forEach((topic, tIndex) => {
            const topicId = `t-${mIndex}-${tIndex}`;
            const topicY = yOffset + (tIndex * 80);


            nodes.push({
                id: topicId,
                type: 'topic', // Use custom type
                data: { label: topic, completed: false, onToggle }, // Pass handler
                position: { x: topicX, y: topicY },
            });

            edges.push({
                id: `e-${moduleId}-${topicId}`,
                source: moduleId,
                target: topicId,
                type: 'smoothstep',
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#cbd5e1',
                },
                style: { stroke: '#cbd5e1' },
            });
        });

        yOffset += moduleHeight + 40; // Gap between modules
    });

    return { nodes, edges };
};


export default function RoadmapGenerator() {
    const { resourceId } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [resource, setResource] = useState<any>(null);
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("timeline");
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const nodeTypes = useMemo(() => ({ topic: TopicNode }), []);

    // Toggle completion handler
    const handleNodeToggle = useCallback((nodeId: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    const newCompleted = !node.data.completed;

                    // Trigger save immediately (better UX than debounce for click)
                    // We can't access updated nodes state here immediately due to closure, 
                    // so we do it in a separate effect or just optimistically update for save?
                    // Let's use the effect approach for simplicity
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            completed: newCompleted,
                        },
                    };
                }
                return node;
            })
        );
    }, [setNodes]);

    // Save Progress
    const saveProgress = useCallback(async (currentNodes: Node[], currentEdges: Edge[]) => {
        if (!user || !resourceId || currentNodes.length === 0) return;

        try {
            const docId = `${user.uid}_${resourceId}`;
            // Clean nodes for saving (remove functions)
            const nodesToSave = currentNodes.map(n => ({
                ...n,
                data: { ...n.data, onToggle: undefined }
            }));

            await setDoc(doc(db, "user_roadmaps", docId), {
                userId: user.uid,
                resourceId: resourceId,
                nodes: nodesToSave,
                edges: currentEdges,
                updatedAt: serverTimestamp()
            }, { merge: true });

            setLastSaved(new Date());
        } catch (err) {
            console.error("Error saving progress:", err);
        }
    }, [user, resourceId]);

    // Auto-save logic (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (nodes.length > 0) {
                saveProgress(nodes, edges);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [nodes, edges, saveProgress]);

    useEffect(() => {
        const fetchResourceAndRoadmap = async () => {
            if (!resourceId) return;

            try {
                setLoading(true);
                // 1. Try finding in static data first (simpler for demo)
                const staticRes = staticResources.find(r => r.id.toString() === resourceId);

                let resData = null;
                if (staticRes) {
                    resData = staticRes;
                } else {
                    const docRef = doc(db, "resources", resourceId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        resData = { id: docSnap.id, ...docSnap.data() };
                    }
                }

                if (!resData) {
                    setError("Resource not found");
                    setLoading(false);
                    return;
                }
                setResource(resData);

                // Check for Saved Roadmap (Persistence)
                if (user) {
                    try {
                        const savedDocId = `${user.uid}_${resourceId}`;
                        const savedDocSnap = await getDoc(doc(db, "user_roadmaps", savedDocId));

                        if (savedDocSnap.exists()) {
                            const savedData = savedDocSnap.data() as SimplifiedSavedRoadmapData;

                            const hydratedNodes = savedData.nodes.map(n => ({
                                ...n,
                                data: { ...n.data, onToggle: handleNodeToggle }
                            }));

                            setNodes(hydratedNodes);
                            setEdges(savedData.edges);
                            setRoadmap({ title: resData.title, description: "Resume your progress...", modules: [] });
                            setLoading(false);
                            return;
                        }
                    } catch (persistErr) {
                        console.warn("Persistence error (likely permissions):", persistErr);
                    }
                }

                // Generate New if no save found
                await generateRoadmap(resData);
            } catch (err) {
                console.error("Error fetching resource:", err);
                setError("Failed to load resource");
            } finally {
                setLoading(false);
            }
        };

        fetchResourceAndRoadmap();
    }, [resourceId, user, handleNodeToggle]);

    useEffect(() => {
        if (roadmap && nodes.length === 0) {
            const { nodes: layoutNodes, edges: layoutEdges } = getLayoutElements(roadmap, handleNodeToggle);
            setNodes(layoutNodes);
            setEdges(layoutEdges);
        }
    }, [roadmap, handleNodeToggle, setNodes, setEdges]);

    const generateRoadmap = async (resData: any) => {
        setGenerating(true);
        try {
            const response = await fetch('http://localhost:5001/api/generate-roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: resData.title,
                    description: resData.description,
                    content: resData.description // In a real app, this would be the actual file content
                })
            });

            if (!response.ok) throw new Error("Failed to generate roadmap");

            const data = await response.json();
            setRoadmap(data);
        } catch (err) {
            console.error("Error generating roadmap:", err);
            setError("Failed to generate AI roadmap. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading resource...</p>
            </div>
        );
    }

    if (error || !resource) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="p-6 bg-destructive/10 rounded-full mb-4">
                    <BookOpen className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground mb-6">{error || "Resource not found"}</p>
                <Link to="/resources">
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Resources
                    </Button>
                </Link>
            </div>
        );
    }


    return (
        <div className={cn("space-y-6 max-w-6xl mx-auto pb-12", !isFullScreen && "animate-fade-in")}>
            {/* Header */}
            <div className={cn("transition-opacity duration-300", isFullScreen ? "opacity-0 h-0 overflow-hidden" : "opacity-100")}>
                <Link to="/resources" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Resources
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                AI Roadmap
                            </Badge>
                            <span className="text-xs text-muted-foreground">Powered by Gemini</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{roadmap?.title || `Roadmap for ${resource.title}`}</h1>
                        <p className="text-muted-foreground text-lg max-w-3xl">
                            {roadmap?.description || "Generating personalized learning path..."}
                        </p>
                    </div>
                </div>
            </div>

            {generating ? (
                <Card className="border-primary/20 shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                            <div className="relative bg-primary/10 p-4 rounded-full">
                                <Share2 className="w-12 h-12 text-primary animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Generating Mind Map</h3>
                        <p className="text-muted-foreground max-w-md">
                            We're using AI to analyze "{resource.title}" and build a collaborative mind map just for you.
                        </p>
                    </CardContent>
                </Card>
            ) : roadmap ? (
                <div className={`flex flex-col gap-4 transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-background p-4' : 'h-[75vh]'}`}>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsFullScreen(!isFullScreen)}>
                            {isFullScreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
                            {isFullScreen ? "Exit Full Screen" : "Full Screen"}
                        </Button>
                    </div>

                    <div className="flex-1 border rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 shadow-sm relative">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onNodeClick={(e, node) => {
                                // Optional: ensure focus or specific logic if needed
                            }}
                            nodeTypes={nodeTypes}
                            fitView
                            attributionPosition="bottom-right"
                            minZoom={0.1}
                            maxZoom={4}
                        >
                            <Background color="#94a3b8" gap={16} />
                            <Controls />
                        </ReactFlow>
                    </div>
                </div>
            ) : (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to generate mind map content.</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
