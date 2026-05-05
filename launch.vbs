Set oShell = CreateObject("WScript.Shell")
oShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
oShell.Run "node server.cjs", 0, False
WScript.Sleep 2000
oShell.Run "http://localhost:3000/index.html", 1, False