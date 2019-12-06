
function vowelBack(s) {
    return [...s].map(c=>
      (x=>
        (z=>
            'code'.includes(z)?c:z
        )((y=>
            String.fromCharCode(y<97?y+26:y>122?y-26:y)
            )(x-('co'.includes(c)?1:
            c==='d'?3:c==='e'?4:
            'aiu'.includes(c)?5:-9))
        ))(c.charCodeAt())
    ).join``
}