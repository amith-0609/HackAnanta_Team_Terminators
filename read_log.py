try:
    with open('server.log', 'r', encoding='utf-16') as f:
        for line in f:
            if "Gemini Error" in line:
                print(line.strip())
except Exception as e:
    print(f"Error reading utf-16: {e}")
    try:
        with open('server.log', 'r', encoding='utf-8') as f:
            for line in f:
                if "Gemini Error" in line:
                    print(line.strip())
    except Exception as e2:
        print(f"Error reading utf-8: {e2}")
