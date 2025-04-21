import modules.scripts as scripts
from modules import ui_components

class QuickProgressRestoreScript(scripts.Script):

    def __init__(self) -> None:
        super().__init__()

    def title(self):
        return "Quick progress restore"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        tabname = "img2img" if is_img2img else "txt2img"

        quick_progress_restore_button = ui_components.ToolButton(value='♻️',
                                                               elem_id=f"{tabname}_quick_progress_restore_button",
                                                               tooltip="Try to reconnect and restore last processing progress")
        return [quick_progress_restore_button]
