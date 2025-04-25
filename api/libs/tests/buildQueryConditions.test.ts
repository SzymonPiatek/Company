import buildQueryConditions from "../helpers/buildQueryConditions";

describe("buildQueryConditions", () => {
  it("returns empty object when no filters or search provided", () => {
    const result = buildQueryConditions({ fields: [], filters: {} });
    expect(result).toEqual({});
  });

  it("builds AND conditions from filters with string and boolean values", () => {
    const result = buildQueryConditions({
      fields: [],
      filters: {
        name: "John",
        isActive: "true",
        age: undefined,
      },
    });

    expect(result).toEqual({
      AND: [
        {
          name: {
            contains: "John",
            mode: "insensitive",
          },
        },
        {
          isActive: {
            equals: true,
          },
        },
      ],
    });
  });

  it("builds OR conditions from search string for multiple fields", () => {
    const result = buildQueryConditions({
      fields: ["name", "description"],
      filters: {},
      search: "hello world",
    });

    expect(result).toEqual({
      OR: [
        { name: { contains: "hello", mode: "insensitive" } },
        { description: { contains: "hello", mode: "insensitive" } },
        { name: { contains: "world", mode: "insensitive" } },
        { description: { contains: "world", mode: "insensitive" } },
      ],
    });
  });

  it("combines AND and OR conditions when both filters and search are provided", () => {
    const result = buildQueryConditions({
      fields: ["title"],
      filters: { status: "active" },
      search: "test",
    });

    expect(result).toEqual({
      AND: [
        {
          status: {
            contains: "active",
            mode: "insensitive",
          },
        },
      ],
      OR: [
        {
          title: {
            contains: "test",
            mode: "insensitive",
          },
        },
      ],
    });
  });

  it("ignores filters with undefined values", () => {
    const result = buildQueryConditions({
      fields: ["email"],
      filters: {
        username: undefined,
        email: "test@example.com",
      },
    });

    expect(result).toEqual({
      AND: [
        {
          email: {
            contains: "test@example.com",
            mode: "insensitive",
          },
        },
      ],
    });
  });
});
