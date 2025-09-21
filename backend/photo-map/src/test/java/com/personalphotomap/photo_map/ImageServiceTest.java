package com.personalphotomap.photo_map;


import com.personalphotomap.dto.ImageDTO;
import com.personalphotomap.model.AppUser;
import com.personalphotomap.model.Image;
import com.personalphotomap.repository.ImageRepository;
import com.personalphotomap.service.ImageDeleteService;
import com.personalphotomap.service.ImageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import com.personalphotomap.service.ImageUploadService;


import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ImageServiceTest {

    @Mock
    private ImageRepository imageRepository;
    @Mock
    private ImageUploadService imageUploadService;
    @Mock
    private ImageDeleteService imageDeleteService;

    @Spy
    @InjectMocks
    private ImageService imageService;

    @Test
    void shouldReturnImageDTOsForCountryAndUserToken() {
        // Arrange
        String token = "mock-token";
        String countryId = "br";

        AppUser mockUser = new AppUser();
        mockUser.setId(1L);
        mockUser.setEmail("leandro@email.com");

        Image image1 = new Image(1L, countryId, "photo1.jpg", mockUser, "path1.jpg", 2023);
        image1.setUploadDate(LocalDateTime.now());

        Image image2 = new Image(2L, countryId, "photo2.jpg", mockUser, "path2.jpg", 2023);
        image2.setUploadDate(LocalDateTime.now());

        List<Image> mockImages = List.of(image1, image2);


        ImageDTO dto1 = new ImageDTO();
        dto1.setId(image1.getId());
        dto1.setFileName(image1.getFileName());
        dto1.setFilePath(image1.getFilePath());
        dto1.setCountryId(image1.getCountryId());
        dto1.setYear(image1.getYear());
        dto1.setUploadDate(image1.getUploadDate());

        ImageDTO dto2 = new ImageDTO();
        dto2.setId(image2.getId());
        dto2.setFileName(image2.getFileName());
        dto2.setFilePath(image2.getFilePath());
        dto2.setCountryId(image2.getCountryId());
        dto2.setYear(image2.getYear());
        dto2.setUploadDate(image2.getUploadDate());

        List<ImageDTO> expectedDTOs = List.of(dto1, dto2);

        // Mocks
        doReturn(mockUser).when(imageService).getUserFromToken(token);
        when(imageRepository.findByCountryIdAndUserId(countryId, mockUser.getId()))
                .thenReturn(mockImages);
        doReturn(expectedDTOs).when(imageService).convertToDTOList(mockImages);

        // Act
        List<ImageDTO> result = imageService.getImagesByCountry(countryId, token);

        // Assert
        assertEquals(2, result.size());
        assertEquals("photo1.jpg", result.get(0).getFileName());
        assertEquals("photo2.jpg", result.get(1).getFileName());

        verify(imageRepository, times(1)).findByCountryIdAndUserId(countryId, mockUser.getId());
    }

    @Test
    void shouldHandleUploadAndReturnListOfUrls() {
        // Arrange
        String token = "mock-token";
        String countryId = "br";
        int year = 2023;

        AppUser mockUser = new AppUser();
        mockUser.setId(1L);
        mockUser.setEmail("leandro@email.com");

        MultipartFile file1 = mock(MultipartFile.class);
        MultipartFile file2 = mock(MultipartFile.class);
        List<MultipartFile> files = List.of(file1, file2);

        // Mocks
        doReturn(mockUser).when(imageService).getUserFromToken(token);

        when(imageUploadService.uploadAndSaveImage(eq(file1), eq(countryId), eq(year), eq(mockUser)))
                .thenReturn(CompletableFuture.completedFuture("https://s3.bucket.com/photo1.jpg"));

        when(imageUploadService.uploadAndSaveImage(eq(file2), eq(countryId), eq(year), eq(mockUser)))
                .thenReturn(CompletableFuture.completedFuture("https://s3.bucket.com/photo2.jpg"));

        // Act
        List<String> result = imageService.handleUpload(files, countryId, year, token);

        // Assert
        assertEquals(2, result.size());
        assertEquals("https://s3.bucket.com/photo1.jpg", result.get(0));
        assertEquals("https://s3.bucket.com/photo2.jpg", result.get(1));

        verify(imageUploadService, times(1)).uploadAndSaveImage(file1, countryId, year, mockUser);
        verify(imageUploadService, times(1)).uploadAndSaveImage(file2, countryId, year, mockUser);
    }
    @Test
    void shouldDeleteAllImagesByCountryForUser() {
        // Arrange
        String token = "mock-token";
        String countryId = "br";

        AppUser mockUser = new AppUser();
        mockUser.setId(1L);
        mockUser.setEmail("leandro@email.com");

        Image image1 = new Image(1L, countryId, "photo1.jpg", mockUser, "path1.jpg", 2023);
        Image image2 = new Image(2L, countryId, "photo2.jpg", mockUser, "path2.jpg", 2023);
        List<Image> mockImages = List.of(image1, image2);

        doReturn(mockUser).when(imageService).getUserFromToken(token);
        when(imageRepository.findByCountryIdAndUserId(countryId, mockUser.getId()))
                .thenReturn(mockImages);

        // Act
        imageService.deleteAllImagesByCountry(countryId, token);

        // Assert
        verify(imageDeleteService, times(1)).deleteImagesInParallel(mockImages);
    }

}
