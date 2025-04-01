from typing import Optional

import modules.scripts as scripts
from fastapi import FastAPI
from gradio import Blocks
from modules import script_callbacks
from modules import shared, sd_models, sd_vae, paths, ui_extra_networks, ui_components, styles, ui_common
from modules.shared import OptionInfo

from scripts.quick_prompt_restore_api import init_api_extension
import scripts.quick_prompt_env as env

env.script_dir = scripts.basedir()

def on_app_started(demo: Optional[Blocks], app: FastAPI):
    init_api_extension(app)


script_callbacks.on_app_started(on_app_started)


class QuickSavePathScript(scripts.Script):

    def __init__(self) -> None:
        super().__init__()

    def title(self):
        return "Quick prompt restore"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        tabname = "img2img" if is_img2img else "txt2img"

        quick_prompt_restore_button = ui_components.ToolButton(value='⏪',
                                                               elem_id=f"{tabname}_quick_prompt_restore_button",
                                                               tooltip="Restore last used prompt")
        return [quick_prompt_restore_button]
