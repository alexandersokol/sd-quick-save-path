function moveQuickRestoreButtons() {
    let tools_txt2img = gradioApp().getElementById("txt2img_tools").querySelector("div");
    tools_txt2img.appendChild(document.getElementById("txt2img_quick_prompt_restore_button"));
    tools_txt2img.appendChild(document.getElementById("txt2img_quick_progress_restore_button"));

    let tools_img2img = gradioApp().getElementById("img2img_tools").querySelector("div");
    tools_img2img.appendChild(document.getElementById("img2img_quick_prompt_restore_button"));
    tools_img2img.appendChild(document.getElementById("img2img_quick_progress_restore_button"));

    let quicksettings = gradioApp().getElementById("quicksettings");
    quicksettings.appendChild(document.getElementById("alternative_progress_row_container"));
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

function request(url, data, handler, errorHandler) {
    const xhr = new XMLHttpRequest();
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
    const js = JSON.stringify(data);
    xhr.send(js);
}

function wrapFunction(target, name, handler) {
    const original = target[name];
    target[name] = function (...args) {
        handler(...args);
        return original.apply(this, args);
    };
}

function onProgressReceived(data) {
    // {
//     "active": true,
//     "queued": false,
//     "completed": false,
//     "progress": 0.7421875,
//     "eta": 50.87419579907467,
//     "live_preview": null,
//     "id_live_preview": -1,
//     "textinfo": null
// }

    function formatEta(seconds) {
        if (typeof seconds !== 'number' || isNaN(seconds)) return '00:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    let statusText = "Idle"
    if (data.active === true) {
        statusText = "In progress"
    } else if (data.queued === true) {
        statusText = "Queued"
    } else if (data.completed === true) {
        statusText = "Completed"
    } else if (data.textinfo != null) {
        statusText = data.textinfo
    }

    updateAlternativeProgress({
        isProgressVisible: data.active,
        percentage: Math.round((data.progress ?? 0) * 100),
        ETA: data.eta != null ? formatEta(data.eta) : '',
        status: statusText
    });
}

function onProgressError() {
    updateAlternativeProgress({
        isProgressVisible: false,
        percentage: 0,
        ETA: '',
        status: ''
    });
}

async function getCurrentProgressData() {
    try {
        const url = new URL(`${window.location.origin}/get-current-task-id`);
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fullData = await response.json();
        const currentTaskId = fullData.data;

        request("./internal/progress",
            {id_task: currentTaskId, live_preview: false},
            function (res) {
                onProgressReceived(res)
            }, function (err) {
                onProgressError()
            })

    } catch (error) {
        onProgressError()
    }
}


window.updateAlternativeProgress = function ({
                                                 isProgressVisible = true,
                                                 percentage = 0,
                                                 ETA = '',
                                                 status = ''
                                             }) {
    const barContainer = document.getElementById('alt-progress-bar-container');
    const barFill = document.getElementById('alt-progress-bar-fill');
    const barText = document.getElementById('alt-progress-bar-text');
    const statusText = document.getElementById('alt-progress-status');

    if (!barContainer || !barFill || !barText || !statusText) {
        console.warn('Progress elements not found.');
        return;
    }

    // Toggle visibility
    barContainer.style.display = isProgressVisible ? 'flex' : 'none';

    // Set progress value and text
    barFill.style.width = `${percentage}%`;
    barText.textContent = `${percentage}% ETA ${ETA}`;

    // Set status
    statusText.textContent = status;
};

let pollingCancelled = false;

async function progressPollLoop() {
    if (pollingCancelled || document.visibilityState !== "visible") return;

    try {
        await getCurrentProgressData()
    } catch (err) {
        console.warn("[Poll] Request failed:", err);
    }
    setTimeout(progressPollLoop, 1000); // wait 1s before next poll
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
        getCurrentProgressData().then(r => "Current progress data fetched successfully");
    })

    const img2imgRestoreProgressButton = document.getElementById("img2img_quick_progress_restore_button")
    img2imgRestoreProgressButton.addEventListener('click', (event) => {
        getCurrentProgressData().then(r => "Current progress data fetched successfully");
    })

    wrapFunction(window, 'localSet', (k, v) => {
        console.log("Intercepted localSet:", k, v);
        saveLocalTaskId(k, v).then(r => "Local task id saved successfully");
    });

    if (document.visibilityState === "visible") progressPollLoop();

    document.addEventListener("visibilitychange", () => {
        pollingCancelled = document.visibilityState !== "visible";
        if (!pollingCancelled) progressPollLoop();
    });
})


