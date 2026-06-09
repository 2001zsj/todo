# 魔法待办 Android APK 打包指南

## 生成 APK 步骤

### 1. 安装 Android Studio
下载：https://developer.android.com/studio  
一路默认安装即可。

### 2. 打开项目
启动 Android Studio → Open → 选择 `android/` 目录 → 等待 Gradle 同步完成。

### 3. 生成 APK
菜单栏：Build → Build Bundle(s) / APK(s) → Build APK(s)

### 4. 获取 APK
编译完成后，APK 在：`android/app/build/outputs/apk/debug/app-debug.apk`

## 签名发布（可选）
如需签名发布版 APK：
1. Build → Generate Signed Bundle / APK → APK
2. 创建新的 keystore（填写密码等信息）
3. 选择 release 构建

## 技术说明
- 使用 WebView 加载 PWA 网页版
- 每次打开都从网络加载最新版本
- 支持离线访问（通过 Service Worker 缓存）
