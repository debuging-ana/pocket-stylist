/*
INSTRUCTIONS TO SET IT UP ON UR DEVICE - julz:

download ollama first!!

1. find ur local IP address:
   - Windows: 
      • type cmd
      • Run: ipconfig
      • Find "IPv4 Address" under ur active network adapter

2. Replace YOUR_LOCAL_IP in two places:
   a) In app.config.js:
      - Replace "YOUR_LOCAL_IP" in NSExceptionDomains 
      - Replace "YOUR_LOCAL_IP" in ollamaBaseUrl 
   b) In THIS file, replace "YOUR_LOCAL_IP" in the OLLAMA_BASE_URL

3. Start Ollama on cmd (windows):
   - Open cmd and type in -> set OLLAMA_HOST=0.0.0.0 ->  start "" "ollama" serve -> can also run 'ollama serve'
   - then -> netstat -ano | findstr 11434 
   (u should see lines containing 0.0.0.0:11434 and ur local ip address with 11434 at the end)
   - then -> curl http://localhost:11434 (replace with ur local ip address with 11434 at the end, u shud see "Ollama is running" if it works)

   ollama shud open if its working
important: make sure ur laptop and phone are connected to SAME network, use npx expo start -c NOT tunnel
check if ur phone can connect thru -> http://[your-ip]:11434
5. run the app normally
------------------------------------------------------------------------------------------------------------------------------------------------
havent tested these myself but:
open terminal on ur mac
ipconfig -> ifconfig -> or for summary ->ipconfig getifaddr en0
will return something like 192.168.x.x -> thats probably ur local ip

replace ur local ip in app.config and in THIS file

start ollama in terminal:
1. open terminal
2. run -> `export OLLAMA_HOST=0.0.0.0`
3. then -> 'ollama serve'
you should see something like ->  listening on 0.0.0.0:11434

OR check if it's responding:
- Run: `curl http://localhost:11434`
-> You should get a response like: `{ "status": "Ollama is running" }`

*/


const OLLAMA_BASE_URL = "http://YOUR_LOCAL_IP:11434" // REPLACE WITH UR IP

// connection test with timeout
const testConnection = async () => {
  try {
    // set up abort controller for timeout functionality
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // sets 5s timeout
    
    // send HEAD request to check if server is reachable
    const response = await fetch(OLLAMA_BASE_URL, {
      method: 'HEAD', // HEAD is faster than GET since we dont need body
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    return response.ok;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

/*
  Generates outfit suggestions using Ollama's LLM
  @param {string} prompt - the formatted outfit suggestion request
  @param {number} timeoutMs - maximum wait time (default 2mins)
  @returns {Promise<string>} - formatted outfit suggestion
 */

// this is the main Ollama service function
export const generateWithLlama = async (prompt, timeoutMs = 120000) => {
  if (!await testConnection()) {
    throw new Error(
      `Cannot connect to Ollama. Please ensure:
      1. Ollama is running ('ollama serve')
      2. Devices on same WiFi
      3. Port 11434 is allowed
      4. Try USB tethering as alternative`
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    /*
     Note: The JSON parsing logic remains here as a placeholder for future API responses.
     but for events.js, Ollama changed to returning in plain text, but if the API starts returning structured JSON again,
     this will be ready to handle it without needing a rewrite
    */

    // sends the actual generation request to Ollama
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2", // switched to match boys one
        prompt: `You are a fashion assistant. ${prompt}`, // role context
        stream: false,
        options: { 
          num_predict: 512, // max tokens to generate
          temperature: 0.7, // for creativity level
          top_p: 0.9, // nucleus sampling parameter
          stop: ["\n\n"] 
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    // parse the json response from ollama (for when i was using json return format)
    const data = await response.json();
    let responseText = data.response.trim();
    if (!responseText.includes('|')) {
      // fallback formatting if response doesnt match expected format
      const lines = responseText.split('\n').filter(line => line.trim().length > 0);
      if (lines.length >= 4) {
        responseText = `${lines[0]} | ${lines[1]} | ${lines[2]} | ${lines[3]} | ${lines.slice(4).join(' ')}`;
      }
    }
    
    return responseText;
  } catch (error) {
    console.error("Ollama API Error:", error);
    
    // return a fallback suggestion if generation fails
    const fallbacks = {
      formal: "Classic Formal | Navy Suit | White Dress Shirt | Oxford Shoes | Timeless professional look",
      casual: "Weekend Casual | Dark Jeans | Graphic Tee | White Sneakers | Comfortable everyday outfit",
      business: "Business Casual | Blazer | Chinos | Loafers | Professional yet approachable",
      party: "Night Out | Silk Shirt | Black Jeans | Chelsea Boots | Stylish party attire"
    };
    
    //try to extract event type for fallback
    const eventType = prompt.includes('formal') ? 'formal' : 
                     prompt.includes('business') ? 'business' : 
                     prompt.includes('party') ? 'party' : 'casual';
    
    return `${fallbacks[eventType] || fallbacks.casual} | (Fallback suggestion)`;
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