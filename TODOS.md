# TODOS/FIXES

1. voice input window not appearing on other screen or windows It does not appear if show app menu in docs is enabled. I guess we should disable that by default and always keep the app as an accessory item.
2. sound not playing when start and stop recording.
3. Accessibility feature is still not working.
4. When microphone change from the UI it does not reflect in the Tray menu bar.
5. It shows that accessibility future has granted access, but we are not able to paste anything. That means we do not have the access to that.
6. add update now or check for updates functionality.
7. Add contact and view privacy policy links and about section in settings.
8. Test export an import again.
9. add analytics and error logging using post-fog but based on the settings.
10. Test Reset Settings If it works or not,
11. See, audio recording, settings, toggle, doesn't actually work, even if it's off, audio recordings are getting saved. So fix that.
12. Launch it start up actually takes a lot of time. Look into that.
13. need a better way of storing the already data that we have for example model.js on snippets and vibes that we already create through Tauri.
14. So, we also need to fix the tray menu, I can for example, general feedback and check for updates and paste last transcript which is not working because of the accessibility future.
15. Remove toast window. We don't need that.
16. By default, the copy and paste option should always be enabled.
17. And the copy button on transcriptions animation is very bad.
18. So, after onboarding if I go directly to the model space and see the whisper local model, it still shows start model. Even when the model is already started, so those status are not up to date. We should make sure that they are up to date.
19. And if this, if the model already started and still show the start model and if we click on it, the model again starts. So basically there can be multiple process for that. Need to fix that we need to make sure that only one process for that model is running no more.
20. We need to find a way to store the logs and library logs under the Dicta app folder, every log that we are console logging.
21. Also, we need a better way or optimize our logging feature. We have a lot of functions but we need better without much of an emojis and log files that we can easily understand.
22. Also implement data the retention for transcriptions. A lot of transcription with lot of voice recordings can be a lot of data. So, if voice recordings see our own, we should also show data retention setting item to the user so that they can easily select okay in 30 days or maybe 40 days they can when then we will just remove the data in 30 to 40 days.
23. have better you add than whisper flow.
24. Remove synk default models button.
25. The logs/application logs should get removed after some time.we should not store a lot of data on the user's device.
26. The wave forms for the audio levels are very small. Even if I talk very loudly, it doesn't really show me that I am talking unless I am screaming. We need to fix that.
