/*
INSTRUCTIONS TO SET IT UP ON UR DEVICE - julz:

1. find ur local IP address:
   - Windows: 
      • type cmd
      • Run: ipconfig
      • Find "IPv4 Address" under ur active network adapter
   - Mac:um search it up maybe

2. Replace YOUR_LOCAL_IP in two places:
   a) In app.config.js:
      - Replace "YOUR_LOCAL_IP" in NSExceptionDomains 
      - Replace "YOUR_LOCAL_IP" in ollamaBaseUrl 
   b) In THIS file, replace "YOUR_LOCAL_IP" in the OLLAMA_BASE_URL

3. Start Ollama on cmd (windows):
   - Open cmd and type in -> start "" "ollama" serve
   - then -> netstat -ano | findstr 11434 
   (u should see lines containing 0.0.0.0:11434 and ur local ip address with 11434 at the end)
   - then -> curl http://localhost:11434 (replace with ur local ip address with 11434 at the end, u shud see "Ollama is running" if it works)

important: make sure ur laptop and phone are connected to SAME network, use npx expo start -c

5. run the app normally
*/

const OLLAMA_BASE_URL = "http://YOUR_LOCAL_IP:11434"; // REPLACE WITH UR IP

// connection test with timeout
const testConnection = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(OLLAMA_BASE_URL, {
      method: 'HEAD',
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    return response.ok;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

// this is the main Ollama service function
export const generateWithLlama = async (prompt) => {
  if (!await testConnection()) {
    throw new Error(
      `Cannot connect to Ollama at ${OLLAMA_BASE_URL}. Please ensure:
      1. Ollama is running on your computer (check with 'ollama serve')
      2. Both devices are on the same WiFi network
      3. Windows Firewall allows port 11434
      4. Try USB tethering as an alternative`
    );
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false
      }),
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()).response;
  } catch (error) {
    console.error("Ollama API Error:", error);
    throw new Error(`AI request failed: ${error.message}`);
  }
};

// react hook for connection status
export const useOllamaStatus = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const check = async () => {
      setIsConnected(await testConnection());
    };
    
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return isConnected;
};