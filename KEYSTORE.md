# Membuat Keystore untuk Tanda Tangan APK

Sebelum mempublikasikan ke Play Store, Anda perlu menandatangani APK
dengan keystore. Berikut langkah-langkahnya.

## Langkah 1: Generate keystore (dummy untuk development)

Jalankan di terminal (di folder `android/` atau root):

```bash
keytool -genkey -v \
  -keystore my-release-key.keystore \
  -alias mario_alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Ikuti prompt:
- Masukkan password keystore (catat!)
- Masukkan ulang password
- Isi data organisasi (nama, kota, negara, dll)
- Masukkan password untuk alias (bisa sama dengan keystore)

Akan tercipta file `my-release-key.keystore`. **JANGAN masukkan ke
git!** Tambahkan ke `.gitignore`.

## Langkah 2: Konfigurasi signing di Gradle

Tambahkan `signingConfigs` ke `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('../my-release-key.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias 'mario_alias'
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

Atau hardcode (kurang aman, jangan untuk produksi):

```gradle
signingConfigs {
    release {
        storeFile file('../my-release-key.keystore')
        storePassword 'YOUR_KEYSTORE_PASSWORD'
        keyAlias 'mario_alias'
        keyPassword 'YOUR_KEY_PASSWORD'
    }
}
```

## Langkah 3: Build APK release

```bash
cd android
./gradlew assembleRelease
```

APK akan berada di:
`android/app/build/outputs/apk/release/app-release.apk`

## Langkah 4 (opsional): Build AAB untuk Play Store

Play Store更喜欢 Android App Bundle (AAB):

```bash
./gradlew bundleRelease
```

File AAB akan berada di:
`android/app/build/outputs/bundle/release/app-release.aab`

Upload `.aab` ke Google Play Console.
