// Generated from ComponentIR. Regenerate with pnpm run generate:unity.
using UnityEngine.UIElements;

namespace FullStackDS
{
    [UxmlElement]
    public partial class Accordion : ItemGroup
    {
        public const string ChannelName = "openness";
        public const string ChangeHandler = "onValueChange";
        [UxmlAttribute] public string Type { get => base.SelectionType; set => base.SelectionType = value; }
        [UxmlAttribute] public new bool Collapsible { get => base.Collapsible; set => base.Collapsible = value; }
        [UxmlAttribute] public new bool Disabled { get => base.Disabled; set => base.Disabled = value; }
        [UxmlAttribute] public new string Value { get => base.Value; set => base.Value = value; }
        public Accordion()
        {
            AddToClassList("accordion");
            SelectionType = "single";
            Collapsible = false;
            Configure("toggle-item", "trigger", "content", "accordion");
            Orientation = "vertical";
            Loop = true;
        }
    }

    [UxmlElement]
    public partial class AccordionItem : SelectionItem { }
}
