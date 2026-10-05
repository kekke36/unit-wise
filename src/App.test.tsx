import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("shopping unit comparison", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("adds products, compares normalized prices, edits, and restores saved entries", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    const storeSelect = screen.getByLabelText("店名");
    expect(within(storeSelect).getByRole("option", { name: "OK" })).toBeTruthy();
    expect(
      within(storeSelect).getByRole("option", { name: "ドンキ" }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /重量/ }));
    expect((screen.getByLabelText("内容量") as HTMLInputElement).value).toBe(
      "",
    );
    await user.type(screen.getByLabelText(/商品名/), "トマト");
    await user.type(screen.getByLabelText("登録する店名"), "青果スーパー");
    await user.click(screen.getByRole("button", { name: "店名を登録" }));
    expect((screen.getByLabelText("店名") as HTMLSelectElement).value).toBe(
      "青果スーパー",
    );
    await user.type(screen.getByLabelText("価格"), "298");
    await user.clear(screen.getByLabelText("内容量"));
    await user.type(screen.getByLabelText("内容量"), "400");
    await user.click(screen.getByRole("button", { name: "商品を追加" }));

    expect(screen.getByText("トマト")).toBeTruthy();
    expect(
      within(screen.getByRole("listitem")).getByText("青果スーパー"),
    ).toBeTruthy();
    expect(screen.getByText(/74\.5/)).toBeTruthy();
    expect(screen.queryByText("最安")).toBeNull();

    const productRow = screen.getByRole("listitem");
    await user.click(
      within(productRow).getByRole("button", { name: "トマトを編集" }),
    );
    await user.clear(screen.getByLabelText("価格"));
    await user.type(screen.getByLabelText("価格"), "398");
    await user.click(screen.getByRole("button", { name: "変更を保存" }));
    expect(screen.getByText(/99\.5/)).toBeTruthy();

    unmount();
    render(<App />);
    expect(screen.getByText("トマト")).toBeTruthy();
    expect(
      within(screen.getByRole("listitem")).getByText("青果スーパー"),
    ).toBeTruthy();
    expect(
      within(screen.getByLabelText("店名")).getByRole("option", {
        name: "青果スーパー",
      }),
    ).toBeTruthy();
    expect(screen.getByText(/99\.5/)).toBeTruthy();
    expect((screen.getByLabelText("内容量") as HTMLInputElement).value).toBe(
      "",
    );

    await user.click(screen.getByRole("button", { name: "トマトを削除" }));
    expect(screen.getByText("比較リストは空です")).toBeTruthy();
  });
});
