"use client";

import { Repository } from "@/utils/types/Repository";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SwitcherProps {
  repositories: Array<Repository>;
  setRepository: (repository: Repository) => void;
  isLoading: boolean;
}

export default function Switcher({
  repositories,
  setRepository,
  isLoading,
}: SwitcherProps) {
  const [activeRepository, setActiveRepository] = useState<Repository | null>();

  const handleChangeRepository = (value: string) => {
    const selectedRepository = repositories.find(
      (repository) => repository.name === value
    );

    if (selectedRepository) {
      setActiveRepository(selectedRepository);
      setRepository(selectedRepository);
    }
  };

  useEffect(() => {
    if (repositories.length > 0 && !activeRepository) {
      setActiveRepository(repositories[0]);
      setRepository(repositories[0]);
    }
  }, [repositories, activeRepository, setRepository]);

  if (!activeRepository || repositories.length === 0) {
    return <span>No repositories found.</span>;
  }

  return (
    <Select
      value={activeRepository.name}
      onValueChange={handleChangeRepository}
    >
      <SelectTrigger className="w-[180px] cursor-pointer">
        <SelectValue placeholder="Select a repository" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Repositories</SelectLabel>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            repositories.map((repository) => (
              <SelectItem key={repository.id} value={repository.name}>
                {repository.name}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
