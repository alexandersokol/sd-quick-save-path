import gradio as gr
import modules.scripts as scripts

from modules import script_callbacks
from modules import shared, sd_models, sd_vae, paths, ui_extra_networks, ui_components, styles, ui_common
from modules.shared import OptionInfo


# def _do_the_input(input_text):
#     print(input_text)
#     try:
#         if not hasattr(shared.opts, "original_pattern"):
#             shared.opts.original_pattern = shared.opts.directories_filename_pattern
#
#         if input_text:
#             new_pattern = input_text
#         else:
#             new_pattern = shared.opts.original_pattern
#
#         if len(new_pattern) <= len(shared.opts.original_pattern):
#             new_pattern = shared.opts.original_pattern
#
#         shared.opts.directories_filename_pattern = new_pattern
#         input_text = new_pattern
#         print(shared.opts.directories_filename_pattern)
#
#     except Exception as e:
#         print(f"An error occurred while accessing directories_filename_pattern: {e}")
#     return gr.Textbox.update(value=input_text)
#
#
# def _do_on_refresh_click():
#     return gr.Textbox.update(value=shared.opts.directories_filename_pattern)
#
#
# def _do_on_reset_click():
#     if hasattr(shared.opts, "original_pattern"):
#         reset_value = shared.opts.original_pattern
#     else:
#         reset_value = shared.opts.directories_filename_pattern
#
#     shared.opts.directories_filename_pattern = reset_value
#
#     return gr.Textbox.update(value=reset_value)
#
#
# class QuickSavePathScript(scripts.Script):
#
#     def __init__(self) -> None:
#         super().__init__()
#
#     def title(self):
#         return "Quick Save Path"
#
#     def show(self, is_img2img):
#         return scripts.AlwaysVisible
#
#     def ui(self, is_img2img):
#
#         tabname = "img2img" if is_img2img else "txt2img"
#
#         if hasattr(shared.opts, "directories_filename_pattern"):
#             directories_filename_pattern = shared.opts.directories_filename_pattern
#         else:
#             directories_filename_pattern = ''
#
#         with gr.Row(elem_id='elem-quick-save-pattern-container', ) as container:
#             quick_edit_pattern_text_box = gr.Textbox(
#                 label='Save dir pattern:',
#                 value=directories_filename_pattern,
#                 max_lines=1,
#                 elem_id='elem-quick-save-pattern-textbox',
#                 scale=1,
#                 inputs=None,
#                 outputs=None,
#                 style={"width": "100px"}
#             )
#             quick_edit_pattern_refresh_button = ui_components.ToolButton(value='🔁',
#                                                                          elem_id=f"{tabname}_quick_save_pattern_refresh_button",
#                                                                          tooltip="Refresh current value")
#             quick_edit_pattern_reset_button = ui_components.ToolButton(value='↪️',
#                                                                        elem_id=f"{tabname}_quick_save_pattern_reset_button",
#                                                                        tooltip="Edit styles")
#
#         quick_edit_pattern_refresh_button.click(_do_on_refresh_click,
#                                                 inputs=None,
#                                                 outputs=quick_edit_pattern_text_box)
#
#         quick_edit_pattern_reset_button.click(_do_on_reset_click,
#                                               inputs=None,
#                                               outputs=quick_edit_pattern_text_box)
#
#         quick_edit_pattern_text_box.change(_do_the_input, inputs=[quick_edit_pattern_text_box], outputs=None)
#
#         return [quick_edit_pattern_text_box, quick_edit_pattern_refresh_button, quick_edit_pattern_reset_button]
