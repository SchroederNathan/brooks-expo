import ExpoModulesCore
import StoreKit

/**
 * The two things the App Clip needs from native code: whether this binary is
 * the Clip, and the system overlay that installs the full app.
 *
 * The module links into the app and the Clip alike; only the Clip's
 * Info.plist carries `NSAppClip`, so the same JS bundle can tell them apart.
 *
 * @ref LLP 0007#one-bundle-two-binaries
 */
public class BrooksAppClipModule: Module {
  private static let isAppClip = Bundle.main.object(forInfoDictionaryKey: "NSAppClip") != nil

  public func definition() -> ModuleDefinition {
    Name("BrooksAppClip")

    Constant("isAppClip") {
      BrooksAppClipModule.isAppClip
    }

    // The App Store's own install card for the full app, at the bottom of the
    // screen. @ref LLP 0007#the-full-app-offer
    AsyncFunction("promptFullAppAsync") {
      guard BrooksAppClipModule.isAppClip else {
        return
      }
      guard let scene = UIApplication.shared.connectedScenes
        .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene
      else {
        throw NoActiveSceneException()
      }
      let overlay = SKOverlay(configuration: SKOverlay.AppClipConfiguration(position: .bottom))
      overlay.present(in: scene)
    }.runOnQueue(.main)
  }
}

// MARK: - Exceptions

final class NoActiveSceneException: Exception, @unchecked Sendable {
  override var reason: String {
    "There is no active window scene to show the App Store overlay in"
  }
}
