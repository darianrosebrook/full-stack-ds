using UnityEngine;
using UnityEngine.UIElements;

namespace FullStackDS.Samples
{
    // Assign Controls.uxml to a UIDocument with a PanelSettings asset.
    [RequireComponent(typeof(UIDocument))]
    public class RuntimeExample : MonoBehaviour
    {
        private Switch sound;
        private void OnEnable()
        {
            sound = GetComponent<UIDocument>().rootVisualElement.Q<Switch>("sound");
            if (sound != null) sound.RegisterValueChangedCallback(SoundChanged);
        }
        private void OnDisable()
        {
            if (sound != null) sound.UnregisterValueChangedCallback(SoundChanged);
        }
        private void SoundChanged(ChangeEvent<bool> evt) => Debug.Log("Sound enabled: " + evt.newValue);
    }
}
