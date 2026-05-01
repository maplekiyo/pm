from pydantic import BaseModel, Field, model_validator


class Card(BaseModel):
    id: str
    title: str
    details: str


class Column(BaseModel):
    id: str
    title: str
    cardIds: list[str]


class BoardData(BaseModel):
    columns: list[Column]
    cards: dict[str, Card]

    @model_validator(mode="after")
    def validate_card_references(self) -> "BoardData":
        seen_card_ids: set[str] = set()

        for card_id, card in self.cards.items():
            if card.id != card_id:
                raise ValueError("Card keys must match card ids")

        for column in self.columns:
            for card_id in column.cardIds:
                if card_id not in self.cards:
                    raise ValueError("Column cardIds must reference existing cards")
                if card_id in seen_card_ids:
                    raise ValueError("Cards can appear in only one column")
                seen_card_ids.add(card_id)

        return self


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    message: str
    board: BoardData | None = None


class AiTestResponse(BaseModel):
    response: str
