using System;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UIElements;

public static class BuildWitness
{
    public static void Run()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var settings = ScriptableObject.CreateInstance<PanelSettings>();
        settings.themeStyleSheet = AssetDatabase.LoadAssetAtPath<ThemeStyleSheet>("Assets/Resources/RuntimeTheme.tss");
        settings.scaleMode = PanelScaleMode.ConstantPixelSize;
        AssetDatabase.CreateAsset(settings, "Assets/Resources/WitnessPanel.asset");
        new GameObject("Independent Player witness").AddComponent<PlayerWitness>();
        EditorSceneManager.SaveScene(scene, "Assets/Witness.unity");
        PlayerSettings.runInBackground = true;
        PlayerSettings.companyName = "FullStackDS";
        PlayerSettings.productName = "Unity standalone witness";
        PlayerSettings.defaultScreenWidth = 640; PlayerSettings.defaultScreenHeight = 800;
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions {
            scenes = new[] { "Assets/Witness.unity" },
            locationPathName = Environment.GetEnvironmentVariable("FSDS_PLAYER_APP"),
            target = BuildTarget.StandaloneOSX, options = BuildOptions.None
        });
        if (report.summary.result != BuildResult.Succeeded) throw new Exception("Player build failed: " + report.summary.result);
    }
}
