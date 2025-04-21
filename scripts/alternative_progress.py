import gradio as gr
import modules.scripts as scripts

from modules import script_callbacks
from modules import shared, sd_models, sd_vae, paths, ui_extra_networks, ui_components, styles, ui_common
from modules.shared import OptionInfo


class AlternativeProgressScript(scripts.Script):

    def __init__(self) -> None:
        super().__init__()

    def title(self):
        return "Quick Save Path"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        with gr.Column(elem_id='alternative_progress_row_container', ) as container:
            container = gr.HTML("""
                  <div id="alternative_progress_container">
                    <div id="alt-progress-wrapper" style="display: flex; align-items: center; gap: 12px; width: 100%;">
                      <div id="alt-progress-bar-container" style="flex-grow: 1; height: 24px; background: #333; border-radius: 8px; overflow: hidden; display: none;">
                        <div id="alt-progress-bar-fill" style="height: 100%; width: 0%; background: #4caf50; transition: width 0.3s;"></div>
                        <span id="alt-progress-bar-text" style="position: absolute; margin-left: 12px; color: white; font-size: 0.9rem;"></span>
                      </div>
                      <div id="alt-progress-status" style="min-width: 100px; text-align: right; font-weight: bold; color: white;"></div>
                    </div>
                  </div>
                """)

        return [container]
