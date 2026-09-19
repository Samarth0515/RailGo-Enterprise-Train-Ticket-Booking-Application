package com.railgo.service;

import com.railgo.dto.StationDto;
import com.railgo.entity.Station;
import com.railgo.exception.BadRequestException;
import com.railgo.exception.ResourceNotFoundException;
import com.railgo.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService {

    private final StationRepository stationRepository;

    @Transactional(readOnly = true)
    public List<StationDto> getAllStations() {
        return stationRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StationDto getStationById(Long id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + id));
        return mapToDto(station);
    }

    @Transactional(readOnly = true)
    public List<StationDto> searchStations(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllStations();
        }
        return stationRepository.searchStations(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public StationDto createStation(StationDto dto) {
        if (stationRepository.existsByCodeIgnoreCase(dto.getCode())) {
            throw new BadRequestException("Station with code " + dto.getCode() + " already exists");
        }

        Station station = Station.builder()
                .code(dto.getCode().toUpperCase().trim())
                .name(dto.getName().trim())
                .city(dto.getCity().trim())
                .state(dto.getState().trim())
                .build();

        return mapToDto(stationRepository.save(station));
    }

    @Transactional
    public StationDto updateStation(Long id, StationDto dto) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + id));

        if (!station.getCode().equalsIgnoreCase(dto.getCode()) &&
                stationRepository.existsByCodeIgnoreCase(dto.getCode())) {
            throw new BadRequestException("Station code " + dto.getCode() + " is already taken");
        }

        station.setCode(dto.getCode().toUpperCase().trim());
        station.setName(dto.getName().trim());
        station.setCity(dto.getCity().trim());
        station.setState(dto.getState().trim());

        return mapToDto(stationRepository.save(station));
    }

    @Transactional
    public void deleteStation(Long id) {
        if (!stationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Station not found with id: " + id);
        }
        stationRepository.deleteById(id);
    }

    private StationDto mapToDto(Station station) {
        return StationDto.builder()
                .id(station.getId())
                .code(station.getCode())
                .name(station.getName())
                .city(station.getCity())
                .state(station.getState())
                .build();
    }
}
