// Generated from ComponentIR. Regenerate with pnpm run generate:unity.
using UnityEngine.UIElements;

namespace FullStackDS
{
    [UxmlElement]
    public partial class Tabs : ItemGroup
    {
        public const string ChannelName = "activeTab";
        public const string ChangeHandler = "onValueChange";
        [UxmlAttribute] public new string Orientation { get => base.Orientation; set => base.Orientation = value; }
        [UxmlAttribute] public new string Appearance { get => base.Appearance; set => base.Appearance = value; }
        [UxmlAttribute] public new string ActivationMode { get => base.ActivationMode; set => base.ActivationMode = value; }
        [UxmlAttribute] public new bool Loop { get => base.Loop; set => base.Loop = value; }
        [UxmlAttribute] public new bool UnmountInactive { get => base.UnmountInactive; set => base.UnmountInactive = value; }
        [UxmlAttribute] public new string Value { get => base.Value; set => base.Value = value; }
        public Tabs()
        {
            AddToClassList("tabs");
            Orientation = "horizontal";
            Appearance = "underline";
            ActivationMode = "automatic";
            Loop = true;
            Configure("select", "tab", "panel", "tabs");
        }
    }

    [UxmlElement]
    public partial class TabsItem : SelectionItem { }
}
