// swift-tools-version:6.0
import PackageDescription

let package = Package(
    name: "ds-swiftui",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .library(name: "DsSwiftUI", targets: ["DsSwiftUI"])
    ],
    targets: [
        .target(name: "DsSwiftUI"),
        .testTarget(
            name: "DsSwiftUITests",
            dependencies: ["DsSwiftUI"]
        ),
        // Press-proof harness: a real AppKit app hosting generated
        // components and delivering synthesized OS mouse clicks. Test-only
        // executable; never admitted to the component allowlist.
        .executableTarget(
            name: "PressProofHarness",
            dependencies: ["DsSwiftUI"],
            path: "Tests/PressProofHarness"
        )
    ]
)
