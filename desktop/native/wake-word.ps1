$ErrorActionPreference = "Stop"

try {
    Add-Type -AssemblyName System.Speech

    $recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
    $choices = New-Object System.Speech.Recognition.Choices
    $choices.Add("hey aura")

    $builder = New-Object System.Speech.Recognition.GrammarBuilder
    $builder.Append($choices)
    $grammar = New-Object System.Speech.Recognition.Grammar($builder)
    $grammar.Name = "AURA Wake Word"

    $recognizer.LoadGrammar($grammar)
    $recognizer.SetInputToDefaultAudioDevice()
    $recognizer.InitialSilenceTimeout = [TimeSpan]::FromSeconds(10)
    $recognizer.BabbleTimeout = [TimeSpan]::FromSeconds(3)

    Register-ObjectEvent -InputObject $recognizer -EventName SpeechRecognized -Action {
        $result = $EventArgs.Result
        if ($result.Confidence -ge 0.55) {
            [Console]::Out.WriteLine("WAKE|{0}|{1}" -f $result.Text, $result.Confidence)
            [Console]::Out.Flush()
        }
    } | Out-Null

    [Console]::Out.WriteLine("READY")
    [Console]::Out.Flush()
    $recognizer.RecognizeAsync([System.Speech.Recognition.RecognizeMode]::Multiple)

    while ($true) {
        Start-Sleep -Seconds 1
    }
}
catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    exit 1
}
