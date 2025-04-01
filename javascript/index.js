function moveQuickRestoreButtons() {
    let tools_txt2img = gradioApp().getElementById("txt2img_tools").querySelector("div");
    tools_txt2img.appendChild(document.getElementById("txt2img_quick_prompt_restore_button"));

    let tools_img2img = gradioApp().getElementById("img2img_tools").querySelector("div");
    tools_img2img.appendChild(document.getElementById("img2img_quick_prompt_restore_button"));
}

function findInputValue(parentDivId) {
    const parentDiv = document.getElementById(parentDivId);
    if (parentDiv) {
        const inputElement = parentDiv.querySelector("input");
        if (inputElement) {
            return inputElement.value;
        }
    }
    return null;
}

function findTextAreaValue(parentDivId) {
    const promptDiv = document.getElementById(parentDivId);
    if (promptDiv) {
        const textArea = promptDiv.querySelector("textarea");
        if (textArea) {
            return textArea.value;
        }
    }
    return null;
}

async function savePromptInputs(isTxt2Img) {
    const prefix = isTxt2Img ? "txt2img" : "img2img";
    const data = {
        positive_prompt: findTextAreaValue(prefix + "_prompt"),
        negative_prompt: findTextAreaValue(prefix + "_neg_prompt"),
        sampler: findInputValue(prefix + "_sampling"),
        sampling_steps: findInputValue(prefix + "_steps"),
        width: findInputValue(prefix + "_width"),
        height: findInputValue(prefix + "_height"),
        cfg_scale: findInputValue(prefix + "_cfg_scale"),
        txt2img: isTxt2Img,
    };

    try {
        const response = await fetch(`${window.location.origin}/quick-prompt-restore`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Data saved successfully:", result);
    } catch (error) {
        console.error("Failed to save data:", error);
    }
}

async function restorePromptData(isTxt2Img) {
    

    try {
        const url = new URL(`${window.location.origin}/quick-prompt-restore`);
        url.searchParams.append("txt2img", isTxt2Img);

        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fullData = await response.json();
        const data = fullData.data;

        const prefix = isTxt2Img ? "txt2img" : "img2img";

        if (data.positive_prompt){
            document.getElementById(`${prefix}_prompt`).querySelector("textarea").value = data.positive_prompt;
        }
        if (data.negative_prompt){
            document.getElementById(`${prefix}_neg_prompt`).querySelector("textarea").value = data.negative_prompt;
        }
        // document.getElementById(`${prefix}_sampling`).querySelector("input").value = data.sampler || "";
        // document.getElementById(`${prefix}_steps`).querySelector("input").value = data.sampling_steps || "";
        // document.getElementById(`${prefix}_width`).querySelector("input").value = data.width || "";
        // document.getElementById(`${prefix}_height`).querySelector("input").value = data.height || "";
        // document.getElementById(`${prefix}_cfg_scale`).querySelector("input").value = data.cfg_scale || "";

        console.log("Data restored successfully:", data);
    } catch (error) {
        console.error("Failed to restore data:", error);
    }
}

onUiLoaded(() => {
    moveQuickRestoreButtons()
    const originalTxt2imgButton = document.getElementById("txt2img_generate");
    if (originalTxt2imgButton) {
        originalTxt2imgButton.addEventListener('click', (event) => {
            savePromptInputs(true).then(r => "Data saved successfully");
        })
    }
    const originalImg2imgButton = document.getElementById("img2img_generate");
    if (originalImg2imgButton) {
        originalImg2imgButton.addEventListener('click', (event) => {
            savePromptInputs(false).then(r => "Data saved successfully");
        })
    }

    const txt2imgRestoreButton = document.getElementById("txt2img_quick_prompt_restore_button")
    txt2imgRestoreButton.addEventListener('click', (event) => {
        restorePromptData(true).then(r => "Data saved successfully");
    })

    const img2imgRestoreButton = document.getElementById("img2img_quick_prompt_restore_button")
    img2imgRestoreButton.addEventListener('click', (event) => {
        restorePromptData(false).then(r => "Data saved successfully");
    })
})