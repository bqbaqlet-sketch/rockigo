param([Parameter(Mandatory=$true)][string]$InputPath,
      [Parameter(Mandatory=$true)][string]$OutputPath)

Add-Type -AssemblyName System.Speech
$speaker = [System.Speech.Synthesis.SpeechSynthesizer]::new()
try {
    $speaker.SelectVoice('Microsoft Irina Desktop')
    $speaker.Rate = 0
    $speaker.SetOutputToWaveFile($OutputPath)
    $speaker.Speak([IO.File]::ReadAllText($InputPath, [Text.Encoding]::UTF8))
} finally {
    $speaker.Dispose()
}
