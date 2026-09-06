// Generated from ComponentIR. Regenerate with pnpm run generate:unity.
using UnityEngine.UIElements;

namespace FullStackDS
{
    [UxmlElement]
    public partial class Popover : AnchoredSurface
    {
        public const string ChannelName = "open";
        public const string ChangeHandler = "onOpenChange";
        [UxmlAttribute] public new bool Disabled { get => base.Disabled; set => base.Disabled = value; }
        [UxmlAttribute] public bool Open { get => value; set => this.value = value; }
        [UxmlAttribute] public new bool CloseOnEscape { get => base.CloseOnEscape; set => base.CloseOnEscape = value; }
        [UxmlAttribute] public new bool CloseOnOutsideClick { get => base.CloseOnOutsideClick; set => base.CloseOnOutsideClick = value; }
        [UxmlAttribute] public new bool CloseOnBlur { get => base.CloseOnBlur; set => base.CloseOnBlur = value; }
        [UxmlAttribute] public new string Placement { get => base.Placement; set => base.Placement = value; }
        public Popover()
        {
            AddToClassList("popover");
            Configure("trigger", "content", "popover");
            CloseOnEscape = true;
            CloseOnOutsideClick = true;
            CloseOnBlur = true;
        }
    }
}
