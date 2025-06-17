## Release Notes

### Version 1.2.4 - Release Date: August 26, 2024

#### Bug Fixes

* **[Integration]**: Fixed the problem of "re-integrating the next-intl", Fixed a bug where 'T is not function'.
* **[LogReport]**: Fixed an issue where the log report failed because the path was too long.

### Version 1.2.3 - Release Date: August 21, 2024

#### Bug Fixes

* **[Integration]**: Fixed the problem of "re-integrating the next-intl", which would cause files not to be found for projects that have not been integrated.
* **[Language]**: Fixed the problem that after resetting the language, the drop-down selection of multi-language options and the multi-language tile display did not change.

### Version 1.2.2 - Release Date: July 25, 2024

#### Feature Support

* **[Login]**: Quick one-click login is now supported, allowing you to swiftly complete login authentication through an already logged-in site account.

#### Bug Fixes

* **[Window Display]**: Fixed issues with the window position and default size.
* **[Others]**: Other bug fixes.

#### Documentation

* **[Documentation Links]**: Added links to the documentation on autoi18n.dev in the FAQ and About sections.

### Version 1.2.1 - Release Date: July 19, 2024

#### Feature Enhancements

* **[Key Feature - Error Reporting]**: Error data can now be reported to the developer. When an error occurs, an error reporting option will appear. Clicking it will redirect you to the reporting page with the error information. If you are already logged in, the error will be automatically reported, including your email and name.

### Version 1.2.0 - Release Date: July 9, 2024

#### Interface Enhancements

* **[App Style]**: The program's interface style has been optimized to follow the overall system theme, making it more modern and better aligned with the autoi18n.dev style.
* **[Layout]**: Layout adjustments have been made, including the addition of icons to multiple buttons, and pages have been made more responsive.

### Version 1.1.3 - Release Date: July 5, 2024

#### Feature Enhancements

* **[File Parsing]**: If the parsed content has not changed, the source code will no longer be modified, avoiding unnecessary processing and the need to reformat too many files.
* **[FAQ]**: Reference code and official documentation links are now provided in the FAQ to help avoid complex issues, given that middleware integration can vary by project.

#### Bug Fixes

* **[Multilingual Support]**: The language identifiers have been verified according to [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1). The identifier for Japanese has been corrected from `jp` to `ja`.
* **[Multilingual Integration]**: Fixed an issue where `[locale]/layout.tsx` should not be processed if it was not re-integrated.

### Version 1.1.2 - Release Date: June 27, 2024

#### Feature Support

* **[Basic Capabilities]**: Support for processing router groupings with parentheses has been added.
* **[Multilingual Support]**: The tool itself now supports switching languages, with Chinese and English currently available.

#### Feature Enhancements

* **[Prompts]**: If the project has not completed the next-intl integration, unchecking the ‘Reintegrate NextIntl’ checkbox will prompt you to select it.
* **[Logging]**: Logs are now saved daily in the `log` folder within the program directory.

#### Bug Fixes

* **[Tag Handling]**: Fixed an issue where empty tags, which do not have names, caused errors when retrieving names. The tool now supports handling empty tags in JSX to maintain code closure.

### Version 1.1.0 - Release Date: June 24, 2024

#### Version Overhaul

* **[Interface Optimization]**: The overall style has been adjusted to be more streamlined.
* **[Framework Upgrade]**: The entire project codebase has been refactored using Vite, Vue, and Tailwind CSS.

#### Bug Fixes

* **[Packaging]**: The Windows version now works correctly, and the missing dependency issue has been resolved.

#### Feature Enhancements

* **[Project Preview]**: The project preview feature is no longer provided as a separate interface and has been removed.
* **[New Addition]**: Multilingual integration is now an optional feature rather than a mandatory one, making it more adaptable to different project needs.
* **[Project Support]**: The multilingual JSON editor feature now supports all projects using next-intl, no longer limited to non-integrated projects.

### Version 1.0.3 - Release Date: June 6, 2024

#### Bug Fixes

* **[Packaging]**: Fixed an issue where the Windows program would report errors due to packaging cache problems.

### Version 1.0.2 - Release Date: May 31, 2024

#### Feature Support

* **[Cleanup]**: Automatic cleanup of extra multilingual JSON files.
* **[Packaging]**: The version now supports packaging for both Windows and macOS installers.

#### User Experience

* **[Interface Optimization]**: Improved the layout of elements on the FAQ page and added numbering.
* **[Installation]**: During Windows installation, you can choose the installation location.
* **[FAQ]**: Documentation updates and corrections have been made, with the addition of several key FAQs and a search box for easier lookup.

#### Bug Fixes

* **[About]**: Fixed the update check button in the About section. Update checks now work correctly and new versions will automatically download at startup if available.
* **[Language Selection Component]**: Disabled the Link preloading feature for this component, which was causing issues with language switching in the production environment.

### Version 1.0.1 - Release Date: May 24, 2024

#### Feature Support

* **[Configuration Panel]**: Supports custom language settings on the home page.
* **[JSON Editing]**: Supports editing multilingual JSON files.
* **[Preview]**: Preview the locally launched project.
* **[FAQ]**: Frequently Asked Questions section.

#### User Experience

* **[Interface Optimization]**: Optimized the display effects of some interfaces.
* **[Feedback]**: Added a user feedback feature.
* **[Update Functionality]**: Added an automatic update feature.
* **[Installer]**: The installer now allows choosing a custom installation location.
