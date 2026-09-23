// @generated:start imports
import { describe, expect, it } from "@jest/globals";
import { CardComponent } from "../Card.component";
// @generated:end

// @generated:start tests
describe("Card — unit", () => {
  it("creates the component class", () => {
    expect(new CardComponent()).toBeInstanceOf(CardComponent);
  });

  it("applies the base CSS class", () => {
    const component = new CardComponent();
    expect(classTokens(component)).toContain("card");
  });

  it("applies density=default variant class", () => {
    const component = new CardComponent();
    component.density = "default";
    expect(classTokens(component)).toContain("card--default");
  });

  it("applies density=inset variant class", () => {
    const component = new CardComponent();
    component.density = "inset";
    expect(classTokens(component)).toContain("card--inset");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { CardContentComponent, CardFooterComponent, CardHeaderComponent } from "../Card.component";

@Component({
  standalone: true,
  imports: [CardComponent, CardHeaderComponent, CardContentComponent, CardFooterComponent],
  template: `
    <fsds-card aria-label="First"><fsds-card-header>One</fsds-card-header><fsds-card-content>Body</fsds-card-content><fsds-card-footer>Foot</fsds-card-footer></fsds-card>
    <fsds-card aria-label="Second"><fsds-card-header>Two</fsds-card-header><fsds-card-content>Body</fsds-card-content><fsds-card-footer>Foot</fsds-card-footer></fsds-card>
  `,
})
class TwoCardsHost {}

describe("Card — landmarks", () => {
  // A card's header and footer belong to the card, not the page: two cards
  // on one page must not contribute two banner/contentinfo landmarks. In
  // HTML those landmarks arise only from header/footer elements or an
  // explicit role, so their absence in the rendered DOM is the whole proof.
  it("exposes no banner or contentinfo landmark for two cards with headers and footers", () => {
    TestBed.configureTestingModule({ imports: [TwoCardsHost] });
    const fixture = TestBed.createComponent(TwoCardsHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll(".card__header")).toHaveLength(2);
    expect(root.querySelectorAll(".card__footer")).toHaveLength(2);
    expect(root.querySelectorAll("header, footer, [role='banner'], [role='contentinfo']")).toHaveLength(0);
  });
});
// @custom:end
