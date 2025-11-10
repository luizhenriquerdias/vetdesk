export type Specialty = {
  id: string;
  name: string;
};

export type CreateSpecialtyDto = {
  name: string;
};

export type UpdateSpecialtyDto = Partial<CreateSpecialtyDto>;

export type SpecialtyResponse = Specialty;

