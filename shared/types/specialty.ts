export type Specialty = {
  id: string;
  name: string;
};

export type CreateSpecialtyDto = {
  name: string;
};

export type UpdateSpecialtyDto = {};

export type SpecialtyResponse = Specialty;

