!include nsDialogs.nsh

XPStyle on

!define ZPASS_NMH_CHROME_KEY "Software\Google\Chrome\NativeMessagingHosts\chromium.extension.zpass"
!define ZPASS_NMH_EDGE_KEY   "Software\Microsoft\Edge\NativeMessagingHosts\chromium.extension.zpass"
!define ZPASS_NMH_MANIFEST   "$INSTDIR\resources\ext-native\manifest.json"

Var /GLOBAL Dialog_1
Var /GLOBAL HLine
Var /GLOBAL Label_1
Var /GLOBAL CheckBox_1
Var /GLOBAL Checkbox_State

# Create a custom uninstall page
UninstPage custom un.nsDialogsPage un.nsDialogsPageLeave  
UninstPage instfiles 

Function un.nsDialogsPage
    ${If} $LANGUAGE == 2052
      StrCpy $0 "是否删除本地用户数据？"
      StrCpy $1 "确定删除本地用户数据"
      GetDlgItem $2 $HWNDPARENT 1
      SendMessage $2 ${WM_SETTEXT} 0 "STR:卸载(&U)"
    ${Else}
      StrCpy $0 "Do you want to delete user data locally?"
      StrCpy $1 "&Confirm to delete local user data"
    ${EndIf}

    nsDialogs::Create 1018
    Pop $Dialog_1
    ${If} $Dialog_1 == error
        Abort
    ${EndIf}
    ${NSD_CreateHLine} 0 30u 100% 12u ""
    Pop $HLine
    ${NSD_CreateLabel} 0 10u 100% 12u $0
    Pop $Label_1
    ${NSD_CreateCheckbox} 0 50u 100% 10u $1
    Pop $CheckBox_1
    nsDialogs::Show
FunctionEnd

Function un.nsDialogsPageLeave
${NSD_GetState} $CheckBox_1 $Checkbox_State
FunctionEnd

Section /o "dump"
  WriteUninstaller "uninstConfirm.exe"
SectionEnd

!macro customUnInit
  ${ifNot} ${isUpdated}
    SetSilent normal
  ${EndIf}
!macroend

!macro customInstall
  WriteRegStr HKCU "${ZPASS_NMH_CHROME_KEY}" "" "${ZPASS_NMH_MANIFEST}"
  WriteRegStr HKCU "${ZPASS_NMH_EDGE_KEY}"   "" "${ZPASS_NMH_MANIFEST}"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "${ZPASS_NMH_CHROME_KEY}"
  DeleteRegKey HKCU "${ZPASS_NMH_EDGE_KEY}"
 
  ${ifNot} ${isUpdated}
    ${If} $Checkbox_State == ${BST_CHECKED}
      RMDir /r $LOCALAPPDATA\zeropass
    ${EndIf}
  ${endIf}
!macroend