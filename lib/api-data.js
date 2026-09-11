// Select only fields that may be sent to a browser, including nested relations.
export const publicUserSelect = { id: true, displayName: true };
export const requestInclude = {
  requester: { select: publicUserSelect },
  receptionist: { select: publicUserSelect },
};
export const questInclude = {
  receptionist: { select: publicUserSelect },
  adventurer: { select: publicUserSelect },
  selectedAdventurers: true,
};
export const requestPayload = (request) => ({
  ...request,
  requesterName: request.requester?.displayName ?? null,
  receptionistName: request.receptionist?.displayName ?? null,
});
export const questPayload = (quest) => ({
  ...quest,
  receptionistName: quest.receptionist?.displayName ?? null,
  adventurerName: quest.adventurer?.displayName ?? null,
  selectedAdventurerIds: (quest.selectedAdventurers ?? []).map((item) => item.adventurerId),
});
export const assignedQuestWhere = (userId) => ({
  OR: [
    { adventurerId: userId },
    { selectedAdventurers: { some: { adventurer: { userId } } } },
  ],
});
export const visibleQuestWhere = (userId) => ({
  OR: [{ status: "募集中" }, ...assignedQuestWhere(userId).OR],
});
