$filesToProcess = @(
    "src/screens/InventoryScreen.tsx",
    "src/screens/EcommerceScreen.tsx",
    "src/screens/DashboardScreen.tsx",
    "src/screens/CRMScreen.tsx",
    "src/screens/AuditScreen.tsx",
    "src/screens/AdminsScreen.tsx",
    "src/screens/AccountingScreen.tsx",
    "src/screens/AccountingActionsScreen.tsx",
    "src/features/accounting/voucher/screens/VoucherHomeScreen.tsx",
    "src/features/accounting/accountgroup/screens/AccountGroupHomeScreen.tsx",
    "src/features/accounting/accountgroup/screens/AccountGroupEditScreen.tsx",
    "src/features/accounting/accountgroup/screens/AccountGroupShowScreen.tsx",
    "src/features/accounting/voucher/screens/VoucherFormScreen.tsx",
    "src/features/accounting/accountgroup/screens/AccountGroupCreateScreen.tsx",
    "src/features/accounting/voucher/screens/VoucherCreateScreen.tsx",
    "src/features/accounting/ledgeraccount/screens/LedgerAccountEditScreen.tsx",
    "src/features/accounting/ledgeraccount/screens/LedgerAccountShowScreen.tsx",
    "src/features/accounting/ledgeraccount/screens/LedgerAccountCreateScreen.tsx",
    "src/features/inventory/product/screens/ProductHomeScreen.tsx",
    "src/features/inventory/product/screens/ProductCreateScreen.tsx"
)

foreach ($file in $filesToProcess) {
    $filePath = Join-Path $PSScriptRoot $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Handle single line import
        $patternSingle = "import {([^}]+), SafeAreaView([^}]*)} from \"react-native\";"
        $replacementSingle = "import {\\$1\\$2} from \"react-native\";`nimport { SafeAreaView } from \"react-native-safe-area-context\";"

        # Handle multi-line import
        $patternMulti = "import {([^,]+,)\s*SafeAreaView,\s*([^}]+)} from \"react-native\";"
        $replacementMulti = "import {\\$1\\$2} from \"react-native\";`nimport { SafeAreaView } from \"react-native-safe-area-context\";"

        # Handle SafeAreaView as a standalone import or at the end of a multiline
        $patternMultiEnd = "import {([^}]+,)\s*SafeAreaView\s*} from \"react-native\";"
        $replacementMultiEnd = "import {\\$1} from \"react-native\";`nimport { SafeAreaView } from \"react-native-safe-area-context\";"

        # Handle multiline import where SafeAreaView is on its own line
        $patternMultiLineAlone = "(?m)(import \{[^\}]+?)( \s*SafeAreaView,?)(\s*\n[^\}]+?\};)"
        $replacementMultiLineAlone = '$1$3' + "`n" + 'import { SafeAreaView } from "react-native-safe-area-context";'


        $newContent = $content
        
        if ($newContent -match $patternSingle) {
            $newContent = $newContent -replace $patternSingle, $replacementSingle
        } elseif ($newContent -match $patternMulti) {
            $newContent = $newContent -replace $patternMulti, $replacementMulti
        } elseif ($newContent -match $patternMultiEnd) {
            $newContent = $newContent -replace $patternMultiEnd, $replacementMultiEnd
        } elseif ($newContent -match $patternMultiLineAlone) {
            $newContent = $newContent -replace $patternMultiLineAlone, $replacementMultiLineAlone
        } else {
             # Fallback for other cases - this is a bit more aggressive
            $newContent = $content.Replace("SafeAreaView,", "").Replace(", SafeAreaView", "")
            if ($newContent -ne $content) { # if something was replaced
                $newContent = $newContent -replace 'from "react-native"', 'from "react-native"' + "`n" + 'import { SafeAreaView } from "react-native-safe-area-context";'
            }
        }
        
        # A more direct replacement if the above logic fails.
        if ($newContent -eq $content) {
            $newContent = $content -replace "import { View, Text, StyleSheet, SafeAreaView } from \"react-native\";", "import { View, Text, StyleSheet } from \"react-native\";`nimport { SafeAreaView } from \"react-native-safe-area-context\";"
            $newContent = $newContent -replace "import { View, ScrollView, StyleSheet, SafeAreaView } from \"react-native\";", "import { View, ScrollView, StyleSheet } from \"react-native\";`nimport { SafeAreaView } from \"react-native-safe-area-context\";"
            $newContent = $newContent -replace "import {([^}]+?),?\s*SafeAreaView\s*,?([^}]*?)}" from \"react-native\"", "import {`$1`$2} from \"react-native\""
            $newContent = $newContent + "`nimport { SafeAreaView } from \"react-native-safe-area-context\";"
        }

        # Final check to remove duplicate empty lines, and fix import syntax
        $newContent = $newContent -replace '(?m)^\s*$', ''
        $newContent = $newContent -replace 'import {} from "react-native";', ''
        $newContent = $newContent -replace ',,', ','
        $newContent = $newContent -replace ',\s*}', ' }'


        Set-Content -Path $filePath -Value $newContent
        Write-Host "Processed $file"
    } else {
        Write-Host "File not found: $file"
    }
}
