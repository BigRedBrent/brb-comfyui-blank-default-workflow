"""Blank Default Workflow

Makes ComfyUI's default workflow blank. ComfyUI opens its default workflow (Load Checkpoint, KSampler and so on)
when the last tab is closed, or when it starts with no tabs to restore. Older versions of ComfyUI's page have that
workflow built in, which blank_default_workflow.js catches as it opens. Newer ones ask the server for it, from
ComfyUI's default_workflow.json file, and this file answers that request with an empty workflow instead. Neither
changes any of ComfyUI's files, so updates don't undo it.
"""

from aiohttp import web

LOG_PREFIX = "[Blank Default Workflow]"

# The same empty workflow ComfyUI's "New" opens.
BLANK_WORKFLOW = {
    "last_node_id": 0,
    "last_link_id": 0,
    "nodes": [],
    "links": [],
    "groups": [],
    "config": {},
    "extra": {},
    "version": 0.4,
}


@web.middleware
async def blank_default_workflow(request, handler):
    # The page asks for "/api/default_workflow"; ComfyUI also answers "/default_workflow".
    if request.method == "GET" and request.path in ("/default_workflow", "/api/default_workflow"):
        return web.json_response(BLANK_WORKFLOW, headers={"Cache-Control": "no-cache"})
    return await handler(request)


try:
    from server import PromptServer

    PromptServer.instance.app.middlewares.append(blank_default_workflow)
except Exception as error:
    print(f"{LOG_PREFIX} Couldn't take over the default workflow: {type(error).__name__}")

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
WEB_DIRECTORY = "."

__all__ = ["WEB_DIRECTORY", "NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS"]
