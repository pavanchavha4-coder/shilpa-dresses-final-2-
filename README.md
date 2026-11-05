# SHILPA DRESSES — Luxury Boutique & VIP Trial Studio
**Developed & Branded by NEXORA Technologies • "Ideas to Impact"**

---

## 1. Overview
**SHILPA DRESSES** is an Android-first luxury couture and boutique application engineered by **NEXORA Technologies**. It combines royal boutique aesthetics (Ivory/Cream `#FDFBF7`, Deep Burgundy `#4A0E17`, and Champagne Gold `#D4AF37`) with production-grade VIP trial salon scheduling, 3D interactive mannequin fabric inspection, and owner operations.

### Key Capabilities:
- **Customer Storefront**: Browse curated collections (Women's Wear, Men's Wear, Kids Wear, Bridal & Couture) without an account, filter by price and fabric, and inspect couture garments in interactive 3D.
- **Three.js Virtual Showroom**: 3D dressmaker mannequin with tailored PBR studio reflections, color swatch selection, weave finish testing (Velvet, Silk, Brocade), and size draping kinematics.
- **VIP Trial Booking Engine**: Conflict-free appointment booking with real-time double-booking prevention, unique booking ID generation (`SHL-2026-XXXX`), and client trial history tracking.
- **Owner Admin Portal**: Complete management suite with real-time Dashboard KPIs, booking approval/rejection workflows, full product CRUD, stock adjustment (+1/-1/+5/+10), calendar slot blocking, and counter POS billing with GST tax invoice generation.
- **Zero-Trust Firebase Integration**: Complete `firebase-blueprint.json` and hardened `firestore.rules` preventing unauthorized writes, with seamless offline local database fallback.

---

## 2. Android Standalone APK Configuration

### Application Identifiers
- **Android Application ID**: `com.nexora.shilpadresses`
- **Application Display Name**: `Shilpa Dresses`
- **Target Platform**: Android (Standalone APK / Google Play bundle)
- **Framework**: React, TypeScript, Vite, Capacitor

### Configuration Files
- `capacitor.config.ts`: Native Android configuration (standalone scheme, splash screen timings, status bar styling).
- `.github/workflows/android-build.yml`: Automated CI/CD workflow to compile debug APK on GitHub Actions.

---

## 3. How to Build the Android APK

### Prerequisites
1. **Node.js**: v18 or v20+
2. **Android Studio**: Ladybug / Hedgehog or newer with Android SDK 34+
3. **Java Development Kit**: JDK 17

### Step-by-Step Build Commands:
```bash
# 1. Install dependencies
npm install

# 2. Build the optimized production web assets
npm run build

# 3. Add Android platform (first time only)
npx cap add android

# 4. Sync web assets and plugins to Android directory
npx cap sync android

# 5. Open project in Android Studio
npx cap open android
```

In Android Studio:
- Select **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate the debug APK.
- The compiled APK is generated at:  
  `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 4. Production Release Signing & Keystore Backup

To publish **Shilpa Dresses** to the Google Play Store or distribute an official signed release APK:

### 1. Generate a Stable Release Keystore
Run the following command once to generate your keystore. **Keep the application ID (`com.nexora.shilpadresses`) and alias identical for all future app updates**:

```bash
keytool -genkey -v -keystore release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias shilpadresses
```

### 2. Configure Gradle Signing
In `android/app/build.gradle`:
```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../release-key.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias "shilpadresses"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build Signed Release Bundle (.aab / .apk)
```bash
cd android
./gradlew bundleRelease
```

### 4. Critical Keystore Backup Policy
> **WARNING**: If you lose your `release-key.jks` file or keystore passwords, you will **never** be able to publish updates for `com.nexora.shilpadresses` to Google Play.
- Securely store an encrypted copy of `release-key.jks` in your team's password manager or cloud key vault.
- Never commit `release-key.jks` or raw passwords into public Git repositories.
- Use GitHub Secrets (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) in CI pipelines.

---

## 5. Google Firebase Setup & Security Rules

### Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase project credentials:
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="shilpa-dresses.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="shilpa-dresses"
VITE_FIREBASE_STORAGE_BUCKET="shilpa-dresses.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
```

### Deploying Hardened Security Rules
```bash
# Login to Firebase CLI
firebase login

# Initialize project and select Firestore
firebase use --add shilpa-dresses

# Deploy security rules
firebase deploy --only firestore:rules
```

---

## 6. Default Boutique Owner Credentials
For immediate testing of the Owner Admin Portal:
- **Work Email**: `admin@shilpadresses.com` (or `shilpa_owner`)
- **Password**: `Nexora@Shilpa2026`
- An **Autofill** button is provided on the login modal for quick staff sign-in.

---
*Developed with pride by NEXORA Technologies • Ideas to Impact*
