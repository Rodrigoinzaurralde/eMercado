#!/bin/bash
encode_text() {
    local TEXTO_A_CODIFICAR="$1"
    
    echo "--- Resultado de Codificación Base64 ---"

    echo -n "$TEXTO_A_CODIFICAR" | base64
    
    echo "" 
    echo "---------------------------------------"
}
if [ "$#" -ge 1 ]; then
    encode_text "$1"
else
    echo "======================================================="
    echo "          Codificador de Texto a Base64 (eMercado)"
    echo "======================================================="
    
    read -r -p "Introduce el texto a codificar: " INPUT_TEXT

    if [ -z "$INPUT_TEXT" ]; then
        echo "Error: No se introdujo texto para codificar."
        exit 1
    fi
    
    encode_text "$INPUT_TEXT"
fi

exit 0