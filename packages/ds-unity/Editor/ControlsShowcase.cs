using UnityEditor;
using UnityEngine.UIElements;

namespace FullStackDS.Editor
{
    public class ControlsShowcase : EditorWindow
    {
        [MenuItem("Window/Full Stack DS/Interactive Controls")]
        public static void Open() => GetWindow<ControlsShowcase>("Full Stack DS");
        public void CreateGUI()
        {
            var sound = new Switch { Label = "Enable sound", Checked = true };
            var accordion = new Accordion { Collapsible = true };
            var first = new AccordionItem { Value = "graphics", Label = "Graphics" };
            first.Add(new Label("Rendering preferences"));
            first.Add(new Switch { Label = "High quality textures" });
            accordion.AddItem(first);
            var second = new AccordionItem { Value = "audio", Label = "Audio" };
            second.Add(new Label("Music and sound effects")); accordion.AddItem(second);
            var tabs = new Tabs();
            var overview = new TabsItem { Value = "overview", Label = "Overview" };
            overview.Add(new Label("Your adventure starts here.")); tabs.AddItem(overview);
            var inventory = new TabsItem { Value = "inventory", Label = "Inventory" };
            inventory.Add(new Label("Your collected items appear here.")); tabs.AddItem(inventory);
            var popover = new Popover { Label = "About these controls" };
            popover.Add(new Label("Generated from the same contracts as the web packages."));
            popover.Add(new Button(() => popover.Open = false) { text = "Close" });
            rootVisualElement.style.paddingLeft = 20;
            rootVisualElement.style.paddingRight = 20;
            rootVisualElement.Add(new Label("Full Stack DS · Unity UI Toolkit"));
            rootVisualElement.Add(sound); rootVisualElement.Add(accordion);
            rootVisualElement.Add(tabs); rootVisualElement.Add(popover);
        }
    }
}
