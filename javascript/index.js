function moveQuickRestoreButtons() {
    let tools_txt2img = gradioApp().getElementById("txt2img_tools").querySelector("div");
    tools_txt2img.appendChild(document.getElementById("txt2img_quick_prompt_restore_button"));
    tools_txt2img.appendChild(document.getElementById("txt2img_quick_progress_restore_button"));

    let tools_img2img = gradioApp().getElementById("img2img_tools").querySelector("div");
    tools_img2img.appendChild(document.getElementById("img2img_quick_prompt_restore_button"));
    tools_img2img.appendChild(document.getElementById("img2img_quick_progress_restore_button"));
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

async function saveLocalTaskId(key, value) {
    const data = {
        key: key,
        value: value
    }

    try {
        const response = await fetch(`${window.location.origin}/save-local-task-id`, {
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
        console.log("Local task id saved successfully:", result);
    } catch (error) {
        console.error("Failed to save local task id:", error);
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

        if (data.positive_prompt) {
            document.getElementById(`${prefix}_prompt`).querySelector("textarea").value = data.positive_prompt;
        }
        if (data.negative_prompt) {
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

async function checkInternalProgress(task_id) {
    try {
        const data = {
            id_task: task_id,
            live_preview: false,
            // id_live_preview: 0
        }

        const response = await fetch(`${window.location.origin}/internal/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log("Internal progress check response:", response);

    } catch (error) {
        console.error("Failed to check internal progress:", error);
    }
}

function request(url, data, handler, errorHandler) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var js = JSON.parse(xhr.responseText);
                    handler(js);
                } catch (error) {
                    console.error(error);
                    errorHandler();
                }
            } else {
                errorHandler();
            }
        }
    };
    var js = JSON.stringify(data);
    xhr.send(js);
}

async function restoreProgressState(isTxt2Img) {
    let task_key;
    if (isTxt2Img) {
        task_key = "txt2img_task_id"
    } else {
        task_key = "img2img_task_id"
    }

    try {
        const url = new URL(`${window.location.origin}/get-local-task-id`);
        url.searchParams.append("key", task_key);

        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fullData = await response.json();
        const data = fullData.data;

        console.log("Latest local task id fetched:", data);
        // checkInternalProgress(data).then(r => "Internal progress checked successfully");

        request("./internal/progress",
            {id_task: data, live_preview: false},
            function (res) {
                console.log("Internal progress checked successfully:", res);
                if ((res.action === true || res.queued === true) && res.completed === false) {
                    console.log("Internal progress is active or queued, restarting progress");
                    localSet(task_key, data);
                    restoreProgressTxt2img();
                } else {
                    console.log("Internal progress is completed, no need to restart");
                }
            }, function (err) {
                console.error("Failed to check internal progress:", err);
            })

    } catch (error) {
        console.error("Failed to fetch local task id");
    }
}

function wrapFunction(target, name, handler) {
    const original = target[name];
    target[name] = function (...args) {
        handler(...args);
        return original.apply(this, args);
    };
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

    const txt2imgRestoreProgressButton = document.getElementById("txt2img_quick_progress_restore_button")
    txt2imgRestoreProgressButton.addEventListener('click', (event) => {
        restoreProgressState(true).then(r => "state restored successfully");
    })

    const img2imgRestoreProgressButton = document.getElementById("img2img_quick_progress_restore_button")
    img2imgRestoreProgressButton.addEventListener('click', (event) => {
        restoreProgressState(false).then(r => "state restored successfully");
    })

    wrapFunction(window, 'localSet', (k, v) => {
        console.log("Intercepted localSet:", k, v);
        saveLocalTaskId(k, v).then(r => "Local task id saved successfully");
    });

    restoreProgressState(true).then(r => "state restored successfully");
})