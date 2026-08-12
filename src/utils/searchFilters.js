export const deepSearchProperty = (property, searchQuery) => {
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase().trim();

  // Helper to safely convert anything to lowercase string
  const str = (val) => (val ? String(val).toLowerCase() : '');

  // Flatten the property values into an array of searchable strings
  const searchableStrings = [
    str(property._id),
    str(property.id),
    str(property.propertyId),
    str(property.address),
    str(property.title),
    // Location
    str(property.location?.city),
    str(property.location?.district),
    str(property.location?.state),
    str(property.location?.taluka),
    str(property.location?.pincode),
    str(property.location?.surveyNumber),
    str(property.location?.subDivisionNumber),
    // Land Details
    str(property.landDetails?.landType),
    str(property.landDetails?.landUseZone),
    str(property.landDetails?.areaSqft),
    // Pricing
    str(property.pricing?.priceINR),
    str(property.pricing?.pricePerSqft),
    str(property.pricing?.govtCircleRate),
    // Legal Status
    str(property.legalStatus?.ownershipType),
    str(property.legalStatus?.documentType),
    str(property.legalStatus?.encumbranceStatus),
    str(property.legalStatus?.disputeStatus),
    // Verification
    str(property.verification?.status),
    // Owner
    str(property.ownerId?.name),
    str(property.ownerId?.email)
  ];

  // Return true if any string includes the query
  return searchableStrings.some(s => s.includes(q));
};

export const filterProperties = (properties, { search, type, state, minPrice, maxPrice, status }) => {
  return properties.filter(p => {
    // 1. Deep Search
    const matchSearch = deepSearchProperty(p, search);

    // 2. State filter
    const matchState = !state || state === 'All States' || 
      (p.location?.state || '').toLowerCase() === state.toLowerCase();

    // 3. Type filter
    const matchType = !type || type === 'all' || 
      (p.landDetails?.landType || '').toLowerCase().includes(type.toLowerCase());

    // 4. Status filter
    let matchStatus = true;
    if (status && status !== 'all') {
      const pStatus = (p.verification?.status || '').toLowerCase();
      matchStatus = pStatus === status.toLowerCase();
    }

    // 5. Price filter
    const price = p.pricing?.priceINR || 0;
    const matchMin = !minPrice || price >= Number(minPrice) * 100000;
    const matchMax = !maxPrice || price <= Number(maxPrice) * 100000;

    // 6. Exclude sold properties (transferred & unlisted)
    const isSold = Array.isArray(p.previousOwners) && p.previousOwners.length > 0 && !p.isListed;

    return matchSearch && matchState && matchType && matchStatus && matchMin && matchMax && !isSold;
  });
};
