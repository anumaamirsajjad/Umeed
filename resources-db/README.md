# Crisis Resources Database

This directory contains the seed data for crisis and professional mental health resources.

## File Structure

- `resources.json` — Complete resource directory in JSON format

## Format

Each resource follows this structure:

```json
{
  "id": "unique-identifier",
  "name": "Organization Name",
  "type": "crisis_hotline|professional|support_group|online_resource",
  "region": "north-america|central-america|south-america|europe|middle-east|africa|south-asia|southeast-asia|east-asia|oceania",
  "country": "Country Name",
  "phone": "+1-800-XXX-XXXX or local format",
  "web": "https://example.com",
  "languages": ["en", "es", "fr"],
  "availability": "24/7|business_hours|specific_times",
  "description": "Brief description of service"
}
```

### Field Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | Unique identifier (lowercase, kebab-case) |
| name | string | Yes | Full organization name |
| type | enum | Yes | Resource type |
| region | string | Yes | Geographic region |
| country | string | Yes | Country name (full form) |
| phone | string | No | Phone number in local format |
| web | string | No | Website URL (HTTPS) |
| languages | array | Yes | Language codes (ISO 639-1) |
| availability | enum | Yes | When resource is available |
| description | string | No | 1-2 sentence description |

### Resource Types

- **crisis_hotline** — Immediate crisis support by phone/text/chat (usually 24/7)
- **professional** — Therapists, counselors, psychiatric services (usually scheduled)
- **support_group** — Peer support groups (scheduled meetings, often online)
- **online_resource** — Websites, directories, educational content

### Language Codes

Use ISO 639-1 (2-letter codes):
- `en` English
- `es` Spanish
- `fr` French
- `de` German
- `zh` Chinese
- `ar` Arabic
- `hi` Hindi
- `pt` Portuguese
- `ja` Japanese
- `ko` Korean

Add others as needed (e.g., `it` Italian, `ru` Russian).

## Adding New Resources

### Before Adding

1. Verify the organization is legitimate and current
2. Confirm phone numbers and websites are working
3. Check availability info (24/7, specific hours, days)
4. Note which languages they support
5. Ensure it aligns with our mission (mental health support, crisis resources, professional referrals)

### Steps

1. Open `resources.json`
2. Add new entry with all required fields
3. Use clear, descriptive ID (e.g., `br-cvv-brazil` for Brazil's CVV)
4. Test the phone number and website if possible
5. Commit with message: "Add [Organization] ([Region])" or "Update [Organization] contact info"

### Example Addition

```json
{
  "id": "nz-samaritans",
  "name": "1737 - Need to talk?",
  "type": "crisis_hotline",
  "region": "oceania",
  "country": "New Zealand",
  "phone": "1737",
  "web": "https://1737.org.nz",
  "languages": ["en"],
  "availability": "24/7",
  "description": "Free call or text service for people in distress. Available 24/7, 365 days a year."
}
```

## Maintaining Accuracy

### Regular Audits

Schedule quarterly audits:
- Pick 5 random resources
- Verify phone numbers still work
- Check websites are accessible
- Confirm hours haven't changed
- Document any changes

### Updating Existing Resources

If a resource's info changes:
1. Update the JSON entry
2. Update `updatedAt` timestamp in database (automatic on save)
3. Commit with message: "Update [Organization] — [what changed]"

### Removing Resources

Only remove if:
- Organization has permanently closed
- Phone numbers are disconnected
- Website is permanently down
- Organization no longer provides mental health support

When removing:
```json
// Don't delete the entire entry, mark as inactive by removing from the active list
// Or if needed to delete, document in commit message why
```

Commit message: "Remove [Organization] — [reason]"

## Regional Coverage

Current coverage:

- ✅ **North America** (USA, Canada, Mexico)
- ✅ **Central/South America** (Brazil)
- ✅ **Europe** (UK)
- ✅ **Africa** (South Africa)
- ✅ **Middle East** (Limited)
- ✅ **South Asia** (India)
- ✅ **East Asia** (Japan)
- ✅ **Southeast Asia** (Limited)
- ✅ **Oceania** (Australia)
- ✅ **Global** (International directories)

### Gaps to Address

- More South America coverage (Colombia, Argentina, Chile)
- Southeast Asia (Thailand, Vietnam, Philippines)
- Middle East beyond limited options
- More African countries
- Oceania beyond Australia
- Eastern Europe

If you add resources for these regions, update this README.

## Data Quality

Keep in mind:
- Phone numbers can change; test periodically
- Organizations may change hours/services
- Websites can be taken down
- Some hotlines may require payment in certain countries

When unsure, include in the description any caveats (e.g., "English-speaking only" or "May have wait times during peak hours").

## Using This Data in the App

The resources are seeded into the database on first run:

```bash
npm run db:seed
```

The database stores these resources so they can be:
1. Served via the `/resources` API endpoint
2. Filtered by region, country, type
3. Surfaced in crisis escalation responses
4. Searched by users

Changes to `resources.json` require re-seeding the database:

```bash
# Clear existing resources and re-seed
npm run db:seed
```

## Questions Before Adding

- **Is this a legitimate mental health resource?** (Crisis lines, therapy, support groups, educational)
- **Is the contact info current?** (Call/check website)
- **Does it serve the region where it's based?** (Or is it global?)
- **Are the hours accurate?** (24/7, weekdays only, etc.)
- **Is it free or low-cost?** (Note if paid service)

---

**Last Updated:** 2026-08-21  
**Current Resources:** 13  
**Regions Covered:** 9 + Global
