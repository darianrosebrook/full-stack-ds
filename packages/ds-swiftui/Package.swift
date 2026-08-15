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
        .target(name: "DsSwiftUI")
    ]
)
