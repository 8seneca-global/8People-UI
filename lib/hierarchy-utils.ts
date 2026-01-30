import type { OrganizationalUnit } from "./mock-data"

/**
 * Builds a hierarchy chain from a given unit up to the root
 * Returns array in bottom-up order [Team, Dept, Division, Company]
 */
export function buildHierarchyChain(
    unitId: string,
    orgUnits: OrganizationalUnit[]
): OrganizationalUnit[] {
    const unit = orgUnits.find((u) => u.id === unitId)
    if (!unit) return []

    // If no parent, this is the root
    if (!unit.parentId) return [unit]

    // Recursively build chain
    return [unit, ...buildHierarchyChain(unit.parentId, orgUnits)]
}

/**
 * Formats hierarchy for display (Top → Bottom)
 * Example: "Technology Division > JavaScript Department > Frontend Team"
 */
export function formatHierarchyDisplay(hierarchy: OrganizationalUnit[]): string {
    // Reverse to show top-to-bottom
    return hierarchy
        .slice()
        .reverse()
        .map((unit) => unit.name)
        .join(" > ")
}

/**
 * Formats hierarchy for compact display (shows only last 2 levels)
 * Example: "JavaScript Department > Frontend Team"
 */
export function formatHierarchyCompact(hierarchy: OrganizationalUnit[]): string {
    const reversed = hierarchy.slice().reverse()
    const compact = reversed.slice(-2) // Take last 2 levels
    return compact.map((unit) => unit.name).join(" > ")
}

/**
 * Gets the immediate parent unit of a given unit
 */
export function getParentUnit(
    unitId: string,
    orgUnits: OrganizationalUnit[]
): OrganizationalUnit | undefined {
    const unit = orgUnits.find((u) => u.id === unitId)
    if (!unit?.parentId) return undefined
    return orgUnits.find((u) => u.id === unit.parentId)
}

/**
 * Gets all child units of a given unit
 */
export function getChildUnits(
    unitId: string,
    orgUnits: OrganizationalUnit[]
): OrganizationalUnit[] {
    return orgUnits.filter((u) => u.parentId === unitId)
}
