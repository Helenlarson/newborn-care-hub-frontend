'use client'

import { ClientOnly, IconButton, Skeleton, Span } from '@chakra-ui/react'
import { ThemeProvider, useTheme } from 'next-themes'
import * as React from 'react'
import { LuSun } from 'react-icons/lu'

export function ColorModeProvider(props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      disableTransitionOnChange
      {...props}
    />
  )
}

// Agora sempre retorna "light"
export function useColorMode() {
  const { setTheme } = useTheme()

  const toggleColorMode = () => {
    // não faz nada (ou mantém light)
    setTheme('light')
  }

  return {
    colorMode: 'light',
    setColorMode: () => setTheme('light'),
    toggleColorMode,
  }
}

// Sempre retorna o valor de "light"
export function useColorModeValue(light, _dark) {
  return light
}

// Sempre mostra o ícone de "sun"
export function ColorModeIcon() {
  return <LuSun />
}

// Botão não alterna mais (mantém light)
export const ColorModeButton = React.forwardRef(function ColorModeButton(
  props,
  ref,
) {
  const { toggleColorMode } = useColorMode()

  return (
    <ClientOnly fallback={<Skeleton boxSize="9" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Color mode locked to light"
        size="sm"
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: '5',
            height: '5',
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  )
})

// Mantém LightMode (opcional)
export const LightMode = React.forwardRef(function LightMode(props, ref) {
  return (
    <Span
      color="fg"
      display="contents"
      className="chakra-theme light"
      colorPalette="gray"
      colorScheme="light"
      ref={ref}
      {...props}
    />
  )
})

// DarkMode pode ser removido, mas deixei caso algum import ainda exista.
// Não será usado porque forcedTheme="light".
export const DarkMode = React.forwardRef(function DarkMode(props, ref) {
  return (
    <Span
      color="fg"
      display="contents"
      className="chakra-theme dark"
      colorPalette="gray"
      colorScheme="dark"
      ref={ref}
      {...props}
    />
  )
})
