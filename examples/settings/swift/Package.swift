// swift-tools-version:6.0
import PackageDescription

let package = Package(
    name: "swift-settings-example",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "SettingsExample", targets: ["SettingsExample"])
    ],
    dependencies: [
        // Local path dependency into the monorepo's generated SwiftUI package.
        // This is the consumer-boundary seam this lane exists to pressure: the
        // app may use only what `import DsSwiftUI` exposes publicly.
        .package(path: "../../../packages/ds-swiftui")
    ],
    targets: [
        .executableTarget(
            name: "SettingsExample",
            dependencies: [
                .product(name: "DsSwiftUI", package: "ds-swiftui")
            ]
        )
    ]
)
