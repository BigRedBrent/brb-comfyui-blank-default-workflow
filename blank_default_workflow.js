import { app } from "../../scripts/app.js";

// The same empty workflow ComfyUI's "New" opens.
const BLANK_WORKFLOW = {
    last_node_id: 0,
    last_link_id: 0,
    nodes: [],
    links: [],
    groups: [],
    config: {},
    extra: {},
    version: 0.4,
};

// ComfyUI's built-in default workflows, recognized by the exact text in their prompt boxes, which no real workflow
// would have: the negative prompt of the current default (also in ComfyUI's default_workflow.json), the start of
// its positive prompt, and the prompt of the older default. Versions of ComfyUI's page that don't ask the server for
// the default workflow open one of these.
const DEFAULT_PROMPTS = [
    "low quality, bad anatomy, extra digits, missing digits, extra limbs, missing limbs",
    "beautiful scenery nature glass bottle landscape, , purple galaxy bottle,",
];
const DEFAULT_PROMPT_START = "anime RPG game style, cute anime girl with gigantic fennec ears";

function isBuiltInDefault(graphData) {
    const nodes = graphData?.nodes;
    if (!Array.isArray(nodes) || nodes.length > 20) {
        return false;
    }
    return nodes.some((node) => {
        const text = node?.type === "CLIPTextEncode" && Array.isArray(node.widgets_values) ? node.widgets_values[0] : null;
        return typeof text === "string" && (DEFAULT_PROMPTS.includes(text) || text.startsWith(DEFAULT_PROMPT_START));
    });
}

app.registerExtension({
    name: "BRB.BlankDefaultWorkflow",
    async setup() {
        // Every workflow ComfyUI opens goes through loadGraphData. When ComfyUI opens its default workflow by
        // itself, after the last tab is closed or at startup, it passes either nothing, or only the built-in
        // default, which has no ID. That gets an empty workflow instead. A default workflow opened on purpose
        // isn't touched: a dragged-in file comes with its file name, a template with more details, and a
        // workflow from a saved file or the queue history with its own ID.
        const loadGraphData = app.loadGraphData;
        app.loadGraphData = function (graphData, ...rest) {
            const missing = !graphData || typeof graphData !== "object" || Array.isArray(graphData);
            const builtIn = rest.length === 0 && !graphData?.id && isBuiltInDefault(graphData);
            if (missing || builtIn) {
                graphData = structuredClone(BLANK_WORKFLOW);
            }
            return loadGraphData.call(this, graphData, ...rest);
        };
    },
});
