import os

from fastapi import FastAPI, Query

import scripts.quick_prompt_env as env


def _get_prompt_file(txt2img: bool):
    prefix = "txt2img" if txt2img else "img2img"
    return os.path.join(env.script_dir, f'{prefix}_saved_prompt.json')


def init_api_extension(app: FastAPI):
    @app.post('/quick-prompt-restore')
    async def save_prompt_date(payload: dict):
        import json  # Ensure JSON module is imported
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
            print("Received JSON body:", payload)

        return {"status": "success", "message": "Prompt saved successfully"}

    @app.get('/quick-prompt-restore')
    async def return_prompt_data(txt2img: bool = Query(..., description="Filter prompts for txt2img or not.")):
        """
        Retrieve all saved prompts from the file if it exists.
    
        :return: JSON content of saved prompts or 404 if the file doesn't exist
        """
        import json
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

