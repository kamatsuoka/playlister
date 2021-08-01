const tablePadding = '7px'
const tableOverrides = {
  TableHeadCell: {
    style: {
      paddingLeft: tablePadding,
      paddingRight: tablePadding
    }
  },
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
