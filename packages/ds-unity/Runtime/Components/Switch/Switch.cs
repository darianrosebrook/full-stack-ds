// Generated from ComponentIR. Regenerate with pnpm run generate:unity.
using UnityEngine.UIElements;

namespace FullStackDS
{
    [UxmlElement]
    public partial class Switch : BooleanControl
    {
        public const string ChannelName = "checked";
        public const string ChangeHandler = "onChange";
        [UxmlAttribute] public new bool Disabled { get => base.Disabled; set => base.Disabled = value; }
        [UxmlAttribute] public bool Checked { get => value; set => this.value = value; }
        public Switch()
        {
            AddToClassList("switch");
            Configure("input", "switch");
            TrackWidth = 48f;
            TrackHeight = 24f;
            ThumbSize = 16f;
        }
    }
}
