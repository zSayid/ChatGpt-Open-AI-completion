const API_KEY = "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";
const API_URL = "https://api.openai.com/v1/chat/completions";

const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");
const resultText = document.getElementById("resultText");


let controller = null


const generate = async () => {

    if (!promptInput.value) {
        alert("Please enter a prompt");
        return;
    }

    generateBtn.disabled = true;
    resultText.innerText = "Generating...";
    stopBtn.disabled = false;

    controller = new AbortController();
    const signal = controller.signal;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: promptInput.value }],
                stream: true,
            }),
            signal,
        });

        const decoder = new TextDecoder("utf-8");
        resultText.innerText = "";
        const reader = response.body.getReader(); // initialize the object reader to read from the response body
        while (true) {
            const chunk = await reader.read();
            const { done, value } = chunk;
            if (done) {
                break; //
            }
            const decodedChunk = decoder.decode(value);
            const lines = decodedChunk.split("\n");
            const parsedLines = lines.map(line => line.replace(/^data: /, "").trim()
            ).filter((line) => line !== "" && line !== "[DONE]")
                .map((line) => JSON.parse(line));

            for (const parsedLine of parsedLines) {
                const { choices } = parsedLine;
                const { delta } = choices[0]
                const { content } = delta;
                if (content) {
                    resultText.innerText += content;
                }
            }
        }

        promptInput.value = "" // clear the prompt af the result
    } catch (error) {
        if (signal.aborted) {
            resultText.innerText = "Request aborted";
        } else {
            resultText.innerText = "Error occured while generating."
            console.error("Error", error);
        }
    } finally {
        generateBtn.disabled = false;
        stopBtn.disabled = true;
        controller = null;
    }
};

const stop = () => {
    if (controller) {
        controller.abort();
        controller = null;
    }
}

// a user either clicks on the generate button or press the enter key when the input field is focused (foydalanuvchi geneate tugmasini yoki enter tugmasini boshishi bilan generate funksiyasi ishga tuhsib ketadi)
generateBtn.addEventListener("click", generate);
promptInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        generate();
    }
});

stopBtn.addEventListener("click", stop);