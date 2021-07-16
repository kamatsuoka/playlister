const tablePadding = '7px'
const tableOverrides = {
  TableBodyRow: {
    style: ({ $theme, $rowIndex }) => ({
      backgroundColor:
        $rowIndex % 2
          ? $theme.colors.backgroundPrimary
          : $theme.colors.backgroundSecondary,
      ':hover': {
        backgroundColor: $theme.colors.backgroundTertiary
      }
    })
  },
  TableHeadCell: {
    style: {
      paddingLeft: tablePadding,
      paddingRight: tablePadding
    }
  },
  TableBodyCell: {
    style: {
      paddingLeft: tablePadding,
      paddingRight: tablePadding,
      paddingTop: tablePadding,
      paddingBottom: tablePadding
    }
  }
}

export { tablePadding, tableOverrides }
