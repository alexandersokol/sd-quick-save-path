import json
import os

import modules.shared as shared
from fastapi import FastAPI, Query, status
from fastapi.responses import JSONResponse

import scripts.quick_prompt_env as env

local_task = {}


def _get_prompt_file(txt2img: bool):
    prefix = "txt2img" if txt2img else "img2img"
    return os.path.join(env.script_dir, f'{prefix}_saved_prompt.json')


def init_api_extension(app: FastAPI):
    @app.post('/quick-prompt-restore')
    async def save_prompt_date(payload: dict):
        required_fields = [
            "positive_prompt",
            "negative_prompt",
            "sampler",
            "sampling_steps",
            "width",
            "height",
            "cfg_scale",
            "txt2img"
        ]

        # Validate the JSON body fields
        if not all(field in payload for field in required_fields):
            return {"status": "error", "message": "Invalid request, missing required fields"}

        # Extract required fields from payload
        extracted_fields = {field: payload[field] for field in required_fields}

        txt2img = extracted_fields["txt2img"] == True

        # Save the extracted fields to a local JSON file
        with open(_get_prompt_file(txt2img), "w") as file:
            json.dump(extracted_fields, file, indent=4)

        return {"status": "success", "message": "Prompt saved successfully"}

    @app.get('/quick-prompt-restore')
    async def return_prompt_data(txt2img: bool = Query(..., description="Filter prompts for txt2img or not.")):
        """
        Retrieve all saved prompts from the file if it exists.
    
        :return: JSON content of saved prompts or 404 if the file doesn't exist
        """
        try:
            prompt_file = _get_prompt_file(txt2img)
            print(prompt_file)
            if not os.path.exists(prompt_file):
                return {"status": "error", "message": "File not found"}, 404

            with open(prompt_file, "r") as file:
                saved_prompt = json.load(file)
                return {"status": "success", "message": "Saved prompts retrieved successfully", "data": saved_prompt}

        except Exception as e:
            return {"status": "error", "message": f"An error occurred: {str(e)}"}, 404

    @app.post('/save-local-task-id')
    async def save_local_task_id(payload: dict):
        required_fields = [
            "key",
            "value"
        ]

        # Validate the JSON body fields
        if not all(field in payload for field in required_fields):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"status": "error", "message": "Invalid request, missing required fields"}
            )

        extracted_fields = {field: payload[field] for field in required_fields}
        local_task[extracted_fields["key"]] = extracted_fields["value"]

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"status": "success", "message": "Local task Id saved successfully"}
        )

    @app.get('/get-local-task-id')
    async def get_local_task_id(key: str = Query(..., description="Local task Id key to retrieve.")):
        try:
            value = local_task.get(key)
            has_time_start = hasattr(shared, 'state') and hasattr(shared.state,
                                                                  'time_start') and shared.state.time_start is not None

            print(f'shared.state.time_start: {shared.state.time_start}')
            print(f'has_time_start: {has_time_start}')
            print(f'local_task: {local_task}')
            print(f'shared.state: {shared.state}')

            if not has_time_start:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"status": "error", "message": f"has_time_start is {has_time_start}"}
                )

            if key in local_task:
                return JSONResponse(
                    status_code=status.HTTP_200_OK,
                    content={"status": "success", "message": "Local task Id retrieved successfully", "data": value}
                )
            else:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"status": "error", "message": f"Key not available"}
                )
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"status": "error", "message": f"An error occurred: {str(e)}"}
            )
